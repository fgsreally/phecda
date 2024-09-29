import type { Msg, NatsConnection, NatsError, Subscription } from 'nats'
import { StringCodec } from 'nats'
import Debug from 'debug'
import type { Factory } from '../../core'
import { Context } from '../../context'
import type { RpcContext, RpcServerOptions } from '../types'
import { HMR } from '../../hmr'

import { createControllerMetaMap, detectAopDep } from '../../helper'

const debug = Debug('phecda-server/nats')

export interface NatsCtx extends RpcContext {
  type: 'nats'
  msg: any

}

export async function bind(nc: NatsConnection, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts: RpcServerOptions = {}) {
  const { globalGuards, globalFilter, globalPipe, globalAddons = [], defaultQueue } = opts
  const sc = StringCodec()
  const subscriptionMap: Record<string, Subscription> = {}
  const existQueue = new Set<string>()

  const metaMap = createControllerMetaMap(meta, (meta) => {
    const { controller, rpc, func, tag } = meta.data
    if (controller === 'rpc' && rpc?.queue !== undefined) {
      debug(`register method "${func}" in module "${tag}"`)
      return true
    }
  })

  detectAopDep(meta, {
    addons: globalAddons,
    guards: globalGuards,
  }, 'rpc')

  Context.applyAddons(globalAddons, nc, 'nats')

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
          const queue = rpc.queue || defaultQueue || tag
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
    const aop = Context.getAop(meta, {
      globalFilter,
      globalGuards,
      globalPipe,
    })
    const context = new Context<NatsCtx>({
      type: 'nats',
      moduleMap,
      meta,
      tag,
      func,
      args,
      id,
      msg,
      isEvent,
      // @ts-expect-error nats ts problem
      queue: msg._msg.subject.toString(),
    })

    await context.run(aop, (returnData) => {
      if (!isEvent)
        msg.respond(sc.encode(JSON.stringify({ data: returnData, id })))
    }, (err) => {
      if (!isEvent)
        msg.respond(sc.encode(JSON.stringify({ data: err, error: true, id })))
    })
  }

  subscribeQueues()

  HMR(async () => {
    for (const i in subscriptionMap)
      subscriptionMap[i].unsubscribe()

    await subscribeQueues()
  })
}
