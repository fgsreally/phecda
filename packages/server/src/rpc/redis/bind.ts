import type Redis from 'ioredis'
import type { Factory } from '../../core'
import type { Meta } from '../../meta'
import { Context, isAopDepInject } from '../../context'
import { IS_DEV } from '../../common'
import type { P } from '../../types'
import { HMR } from '../../hmr'

export interface Options {
  globalGuards?: string[]
  globalInterceptors?: string[]
}
export interface RedisCtx extends P.BaseContext {
  type: 'redis'
  redis: Redis
  msg: string
  channel: string
  data: any

}

export function bind(sub: Redis, pub: Redis, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts?: Options) {
  const { globalGuards = [], globalInterceptors = [] } = opts || {}
  const existQueueMetaMap = new Map<string, Meta>()

  function detect() {
    IS_DEV && isAopDepInject(meta, {
      guards: globalGuards,
      interceptors: globalInterceptors,
    })
  }

  detect()
  subscribeQueues()

  async function subscribeQueues() {
    for (const item of meta) {
      const {
        data: {
          rpc, tag,
        },
      } = item

      if (rpc?.type && (rpc.type.includes('redis') || rpc.type.includes('*'))) {
        const queue = `PS:${tag as string}`

        if (existQueueMetaMap.has(queue))
          continue

        existQueueMetaMap.set(queue, item)

        await sub.subscribe(queue)
      }
    }
  }

  sub.on('message', async (channel, msg) => {
    const meta = existQueueMetaMap.get(channel)
    if (!meta)
      return

    if (msg) {
      const returnQueue = `${channel}/return`

      const {
        data: { rpc, tag, guards, interceptors, params, name, filter, ctx },
        paramsType,
      } = meta

      const isEvent = rpc!.isEvent
      const data = JSON.parse(msg)
      const { method, args, id } = data

      const context = new Context({
        type: 'redis',
        moduleMap,
        redis: sub,
        meta,
        msg,
        channel,
        tag: tag as string,
        data,
      })

      try {
        await context.useGuard([...globalGuards, ...guards])
        const cache = await context.useInterceptor([...globalInterceptors, ...interceptors])
        if (cache !== undefined) {
          if (!isEvent)
            pub.publish(returnQueue, JSON.stringify({ data: cache, id }))

          return
        }

        const handleArgs = await context.usePipe(params.map(({ type, key, pipe, pipeOpts, index }, i) => {
          return { arg: args[i], pipe, pipeOpts, key, type, index, reflect: paramsType[index] }
        }))

        const instance = moduleMap.get(name)
        if (ctx)
          instance[ctx] = context.data
        const funcData = await instance[method](...handleArgs)
        const res = await context.usePostInterceptor(funcData)

        if (!isEvent)
          pub.publish(returnQueue, JSON.stringify({ data: res, id }))
      }
      catch (e) {
        const ret = await context.useFilter(e, filter)
        if (!isEvent) {
          pub.publish(returnQueue, JSON.stringify({
            data: ret,
            error: true,
            id,
          }))
        }
      }
    }
  })
  HMR(async () => {
    detect()
    for (const queue of Object.keys(existQueueMetaMap))
      await sub.unsubscribe(queue)
    existQueueMetaMap.clear()
    subscribeQueues()
  })
}
