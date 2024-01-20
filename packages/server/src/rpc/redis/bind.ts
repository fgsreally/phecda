import Redis from 'ioredis'
import type { Factory } from '../../core'
import type { PMeta } from '../../meta'
import { BadRequestException } from '../../exception'
import { Context, isAopDepInject } from '../../context'
import { IS_DEV } from '../../common'
import { P } from '../../types'

export interface Options {
  globalGuards?: string[]
  globalInterceptors?: string[]

}
export interface RedisCtx extends P.BaseContext{
  type: 'redis'

  redis: Redis
  msg: string
  channel: string
  // JSON parse msg
  data: any

}


export function bind(redis: Redis, channel: string, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts?: Options) {
  const metaMap = new Map<string, PMeta>()

  const pub = new Redis(redis.options)
  const { globalGuards = [], globalInterceptors = [] } = opts || {}

  isAopDepInject(meta, {
    guards: globalGuards,
    interceptors: globalInterceptors,
  })
  function handleMeta() {
    for (const item of meta) {
      const { data: { rpc, method, name } } = item

      if (rpc?.type && rpc.type.includes('mq'))
        metaMap.set(`${name}-${method}`, item)
    }
  }

  handleMeta()

  redis.subscribe(channel)

  redis.on('message', async (channel, msg) => {
    if (msg) {
      const data = JSON.parse(msg)
      const { tag, args, id, queue } = data
      if (!metaMap.has(tag)) {
        queue && pub.publish(queue, JSON.stringify({
          data: new BadRequestException(`service "${tag}" doesn't exist`).data,
          error: true,
          id,
        }))
        return
      }
      const context = new Context( {
        type: 'redis',
        moduleMap,
        redis,
        meta: metaMap.get(tag)!,
        msg,
        channel,
        tag,
        data,
      })
    
      const {
        data: {
          guards, interceptors, params, name, method, filter,
        },
        paramsType,
      } = metaMap.get(tag)!
      try {
        await context.useGuard([...globalGuards, ...guards])
        const cache = await context.useInterceptor([...globalInterceptors, ...interceptors])
        if (cache !== undefined) {
          if (queue)
            pub.publish(queue, JSON.stringify({ data: cache, id }))

          return
        }

        const handleArgs = await context.usePipe(params.map(({ type, key, pipe, pipeOpts, index }, i) => {
          return { arg: args[i], pipe, pipeOpts, key, type, index, reflect: paramsType[index] }
        }))

        const funcData = await moduleMap.get(name)[method](...handleArgs)
        const res = await context.usePostInterceptor(funcData)

        queue && pub.publish(queue, JSON.stringify({ data: res, id }))
      }
      catch (e) {
        const ret = await context.useFilter(e, filter)
        queue && pub.publish(queue, JSON.stringify({
          data: ret,
          error: true,
          id,
        }))
      }
    }
  })

  if (IS_DEV) {
    globalThis.__PS_HMR__?.push(async () => {
      handleMeta()
    })
  }
}
