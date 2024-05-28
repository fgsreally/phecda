import type Redis from 'ioredis'
import Debug from 'debug'
import type { Factory } from '../../core'
import type { ControllerMeta } from '../../meta'
import { Context, detectAopDep } from '../../context'
import type { RpcContext } from '../../types'
import { HMR } from '../../hmr'
import type { RpcServerOptions } from '../helper'

const debug = Debug('phecda-server/redis')

export interface RedisCtx extends RpcContext {
  type: 'redis'
  redis: Redis
  msg: string
  channel: string

}

export function bind(sub: Redis, pub: Redis, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts?: RpcServerOptions) {
  const { globalGuards = [], globalInterceptors = [] } = opts || {}

  const metaMap = new Map<string, Record<string, ControllerMeta>>()
  const existQueue = new Set<string>()
  function handleMeta() {
    metaMap.clear()
    for (const item of meta) {
      const { tag, func, controller, rpc } = item.data
      if (controller !== 'rpc' || rpc?.queue === undefined)
        continue

      if (metaMap.has(tag))
        metaMap.get(tag)![func] = item as ControllerMeta

      else
        metaMap.set(tag, { [func]: item as ControllerMeta })
    }
  }

  async function subscribeQueues() {
    existQueue.clear()

    for (const [tag, record] of metaMap) {
      for (const func in record) {
        const meta = metaMap.get(tag)![func]
        const {
          data: {
            rpc,
          },
        } = meta
        if (rpc) {
          const queue = rpc.queue || tag

          if (existQueue.has(queue))
            continue
          existQueue.add(queue)
          await sub.subscribe(queue)
        }
      }
    }
  }

  sub.on('message', async (channel, msg) => {
    if (!existQueue.has(channel))
      return

    if (msg) {
      const data = JSON.parse(msg)
      const { func, args, id, tag, queue: clientQueue, _ps } = data
      debug(`invoke method "${func}" in module "${tag}"`)

      if (_ps !== 1)
        return
      const meta = metaMap.get(tag)![func]

      const {
        data: { rpc: { isEvent } = {}, guards, interceptors, params, name, filter, ctx },
        paramsType,
      } = meta

      const context = new Context(<RedisCtx>{
        type: 'redis',
        moduleMap,
        redis: sub,
        meta,
        msg,
        channel,
        tag,
        func,
        data,
        send(data) {
          if (!isEvent)
            pub.publish(clientQueue, JSON.stringify({ data, id }))
        },

      })

      try {
        await context.useGuard([...globalGuards, ...guards])
        const i1 = await context.useInterceptor([...globalInterceptors, ...interceptors])
        if (i1 !== undefined)

          return i1

        const handleArgs = await context.usePipe(params.map((param, i) => {
          return { arg: args[i], reflect: paramsType[i], ...param }
        }))

        const instance = moduleMap.get(name)
        if (ctx)
          instance[ctx] = context.data
        const funcData = await instance[func](...handleArgs)
        const i2 = await context.usePostInterceptor(funcData)

        if (i2 !== undefined)
          return i2
        if (!isEvent)
          pub.publish(clientQueue, JSON.stringify({ data: funcData, id }))
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
  }, 'rpc')
  handleMeta()
  subscribeQueues()
  HMR(async () => {
    detectAopDep(meta, {
      guards: globalGuards,
      interceptors: globalInterceptors,
    }, 'rpc')
    handleMeta()
    for (const queue of existQueue)
      await sub.unsubscribe(queue)

    subscribeQueues()
  })
}
