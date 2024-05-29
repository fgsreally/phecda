import type { Msg, NatsConnection, NatsError, Subscription } from 'nats'
import { StringCodec } from 'nats'
import Debug from 'debug'
import type { Factory } from '../../core'
import { Context, detectAopDep } from '../../context'
import type { RpcContext } from '../../types'
import { HMR } from '../../hmr'
import type { RpcServerOptions } from '../helper'
import type { ControllerMeta } from '../../meta'

const debug = Debug('phecda-server/nats')

export interface NatsCtx extends RpcContext {
  type: 'nats'
  msg: any

}

export async function bind(nc: NatsConnection, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts?: RpcServerOptions) {
  const { globalGuards = [], globalInterceptors = [] } = opts || {}
  const sc = StringCodec()
  const subscriptionMap: Record<string, Subscription> = {}

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
          subscriptionMap[queue] = nc.subscribe(queue, {
            queue,
            callback: handleRequest,
          })
        }
      }
    }
  }
  async function handleRequest(_: NatsError | null, msg: Msg) {
    const data = JSON.parse(sc.decode(msg.data))
    const { tag, func, id, _ps, args } = data

    if (_ps !== 1)
      return
    debug(`invoke method "${func}" in module "${tag}"`)
    const meta = metaMap.get(tag)![func]

    const {
      data: { rpc: { isEvent } = {} },
    } = meta

    if (isEvent)// nats has to have response
      msg.respond('{}')

    const context = new Context<NatsCtx>({
      type: 'nats',
      moduleMap,
      meta,
      tag,
      func,
      args,
      id,
      msg,
      send(data) {
        if (!isEvent)
          msg.respond(sc.encode(JSON.stringify({ data, id })))
      },
    })

    await context.run((returnData) => {
      if (!isEvent)
        msg.respond(sc.encode(JSON.stringify({ data: returnData, id })))
    }, (err) => {
      if (!isEvent)
        msg.respond(sc.encode(JSON.stringify({ data: err, error: true, id })))
    })
  }

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

    for (const i in subscriptionMap)
      subscriptionMap[i].unsubscribe()

    await subscribeQueues()
  })
}
