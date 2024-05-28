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
    const { tag, func, args, id, _ps } = data

    if (_ps !== 1)
      return
    debug(`invoke method "${func}" in module "${tag}"`)
    const meta = metaMap.get(tag)![func]

    const {
      data: { rpc: { isEvent } = {}, guards, interceptors, params, name, filter, ctx },
      paramsType,
    } = meta

    if (isEvent)// nats has to have response
      msg.respond('{}')

    const context = new Context<NatsCtx>({
      type: 'nats',
      moduleMap,
      meta,
      tag,
      func,
      data,
      msg,
      send(data) {
        if (!isEvent)
          msg.respond(sc.encode(JSON.stringify({ data, id })))
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
        msg.respond(sc.encode(JSON.stringify({ data: funcData, id })))
    }
    catch (e) {
      const ret = await context.useFilter(e, filter)
      if (!isEvent)
        msg.respond(sc.encode(JSON.stringify({ data: ret, error: true, id })))
    }
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
