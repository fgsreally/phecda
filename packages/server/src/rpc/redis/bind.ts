import type Redis from 'ioredis'
import type { Factory } from '../../core'
import type { Meta } from '../../meta'
import { Context, detectAopDep } from '../../context'
import type { P } from '../../types'
import { HMR } from '../../hmr'
import type { RpcServerOptions } from '../helper'

export interface RedisCtx extends P.BaseContext {
  type: 'redis'
  redis: Redis
  msg: string
  channel: string
  data: any

}

export function bind(sub: Redis, pub: Redis, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts?: RpcServerOptions) {
  const { globalGuards = [], globalInterceptors = [] } = opts || {}

  const metaMap = new Map<string, Record<string, Meta>>()
  const existQueue = new Set<string>()
  function handleMeta() {
    metaMap.clear()
    for (const item of meta) {
      const { tag, method, rpc, interceptors, guards } = item.data
      if (!rpc)
        continue
      detectAopDep(meta, {
        guards,
        interceptors,
      })
      if (metaMap.has(tag))
        metaMap.get(tag)![method] = item

      else
        metaMap.set(tag, { [method]: item })
    }
  }

  async function subscribeQueues() {
    existQueue.clear()
    for (const item of meta) {
      const {
        data: {
          rpc, tag,
        },
      } = item
      if (rpc) {
        const queue = rpc.queue || tag
        if (existQueue.has(queue))
          continue
        existQueue.add(queue)
        await sub.subscribe(queue)
      }
    }
  }

  sub.on('message', async (channel, msg) => {
    if (!existQueue.has(channel))
      return

    if (msg) {
      const data = JSON.parse(msg)
      const { method, args, id, tag, queue: clientQueue } = data
      const meta = metaMap.get(tag)![method]

      const {
        data: { rpc: { isEvent } = {}, guards, interceptors, params, name, filter, ctx },
        paramsType,
      } = meta

      const context = new Context({
        type: 'redis',
        moduleMap,
        redis: sub,
        meta,
        msg,
        channel,
        tag,
        method,
        data,
      })

      try {
        await context.useGuard([...globalGuards, ...guards])
        const cache = await context.useInterceptor([...globalInterceptors, ...interceptors])
        if (cache !== undefined) {
          if (!isEvent)
            pub.publish(clientQueue, JSON.stringify({ data: cache, id }))

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
          pub.publish(clientQueue, JSON.stringify({ data: res, id }))
      }
      catch (e) {
        const ret = await context.useFilter(e, filter)
        if (!isEvent) {
          pub.publish(clientQueue, JSON.stringify({
            data: ret,
            error: true,
            id,
          }))
        }
      }
    }
  })

  detectAopDep(meta, {
    guards: globalGuards,
    interceptors: globalInterceptors,
  })
  handleMeta()
  subscribeQueues()
  HMR(async () => {
    detectAopDep(meta, {
      guards: globalGuards,
      interceptors: globalInterceptors,
    })
    handleMeta()
    for (const queue of existQueue)
      await sub.unsubscribe(queue)

    subscribeQueues()
  })
}
