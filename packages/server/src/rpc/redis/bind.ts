import type Redis from 'ioredis'
import Debug from 'debug'
import type { Factory } from '../../core'
import { Context } from '../../context'
import type { RpcContext, RpcServerOptions } from '../types'
import { HMR } from '../../hmr'
import { createControllerMetaMap, detectAopDep } from '../../helper'

const debug = Debug('phecda-server/redis')

export interface RedisCtx extends RpcContext {
  type: 'redis'
  redis: Redis
  msg: string
  channel: string

}

export function bind({ sub, pub }: { sub: Redis; pub: Redis }, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts: RpcServerOptions = {}) {
  const { globalGuards, globalInterceptors, globalFilter, globalPipe } = opts
  const metaMap = createControllerMetaMap(meta, (meta) => {
    const { controller, rpc, func, tag } = meta.data
    if (controller === 'rpc' && rpc?.queue !== undefined) {
      debug(`register method "${func}" in module "${tag}"`)
      return true
    }
  })

  detectAopDep(meta, {
    guards: globalGuards,
    interceptors: globalInterceptors,
  }, 'rpc')

  const existQueue = new Set<string>()

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
      const { func, id, tag, queue: clientQueue, _ps, args } = data
      debug(`invoke method "${func}" in module "${tag}"`)

      if (_ps !== 1)
        return
      const meta = metaMap.get(tag)![func]

      const {
        data: { rpc: { isEvent } = {} },
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
        args,
        id,
        isEvent,
        queue: channel,

      })
      await context.run({
        globalGuards, globalInterceptors, globalFilter, globalPipe,
      }, (returnData) => {
        if (!isEvent)
          pub.publish(clientQueue, JSON.stringify({ data: returnData, id }))
      }, (err) => {
        if (!isEvent) {
          pub.publish(clientQueue, JSON.stringify({
            data: err,
            error: true,
            id,
          }))
        }
      })
    }
  })

  subscribeQueues()
  HMR(async () => {
    for (const queue of existQueue)
      await sub.unsubscribe(queue)

    subscribeQueues()
  })
}
