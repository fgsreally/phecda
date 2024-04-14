import type Redis from 'ioredis'
import type { Factory } from '../../core'
import type { Meta } from '../../meta'
import { Context, isAopDepInject } from '../../context'
import { IS_DEV } from '../../common'
import type { P } from '../../types'
import { HMR } from '../../hmr'
import { generateReturnQueue } from '../helper'

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

  function detect() {
    IS_DEV && isAopDepInject(meta, {
      guards: globalGuards,
      interceptors: globalInterceptors,
    })
  }

  const metaMap = new Map<string, Record<string, Meta>>()
  const existQueue = new Set<string>()
  function handleMeta() {
    metaMap.clear()
    for (const item of meta) {
      const { tag, method, http } = item.data
      if (!http?.type)
        continue
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
        existQueue.add(queue)
        await sub.subscribe(queue)
      }
    }
  }

  sub.on('message', async (channel, msg) => {
    if (!existQueue.has(channel))
      return

    if (msg) {
      const returnQueue = generateReturnQueue(channel)
      const data = JSON.parse(msg)
      const { method, args, id, tag } = data
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

  detect()
  handleMeta()
  subscribeQueues()
  HMR(async () => {
    detect()
    handleMeta()
    for (const queue of existQueue)
      await sub.unsubscribe(queue)

    subscribeQueues()
  })
}
