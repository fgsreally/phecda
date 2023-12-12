import Redis from 'ioredis'
import type { Factory } from '../../core'
import type { Meta } from '../../meta'
import { BadRequestException } from '../../exception'
import { Context } from './context'

export interface Options {
  globalGuards?: string[]
  globalInterceptors?: string[]

}

export function bind(redis: Redis, channel: string, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts?: Options) {
  const metaMap = new Map<string, Meta>()

  const pub = new Redis(redis.options)
  const { globalGuards = [], globalInterceptors = [] } = opts || {}
  function handleMeta() {
    for (const item of meta) {
      const { data: { rpc, method, name } } = item

      if (rpc && rpc.includes('mq'))
        metaMap.set(`${name}-${method}`, item)
    }
  }

  handleMeta()

  redis.subscribe(channel)

  redis.on('message', async (channel, msg) => {
    if (msg) {
      const data = JSON.parse(msg)
      const { tag, args, id, queue } = data
      const context = new Context(tag, {
        type: 'redis',
        moduleMap,
        redis,
        meta: metaMap.get(tag),
        msg,
        channel,
        data,
      })

      try {
        if (!metaMap.has(tag))
          throw new BadRequestException(`service "${tag}" doesn't exist`)

        const {
          data: {
            guards, interceptors, params, name, method,
          },
          reflect,
        } = metaMap.get(tag)!

        await context.useGuard([...globalGuards, ...guards])
        if (await context.useInterceptor([...globalInterceptors, ...interceptors]))
          return

        const handleArgs = await context.usePipe(params.map(({ type, key, option, index }, i) => {
          return { arg: args[i], option, key, type, index, reflect: reflect[index] }
        }))

        const funcData = await moduleMap.get(name)[method](...handleArgs)
        const res = await context.usePostInterceptor(funcData)

        pub.publish(queue, JSON.stringify({ data: res, id }))
      }
      catch (e) {
        const ret = await context.useFilter(e)
        pub.publish(queue, JSON.stringify({
          data: ret,
          error: ret.error,
          id,
        }))
      }
    }
  })

  if (process.env.NODE_ENV === 'development') {
    // @ts-expect-error globalThis
    const rawMetaHmr = globalThis.__PS_WRITEMETA__
    // @ts-expect-error globalThis

    globalThis.__PS_WRITEMETA__ = () => {
      handleMeta()
      rawMetaHmr?.()
    }
  }
}
