import type { NatsConnection, Subscription } from 'nats'
import { StringCodec } from 'nats'
import Debug from 'debug'
import type { Factory } from '../../core'
import { Context, detectAopDep } from '../../context'
import type { RpcContext } from '../../types'
import { HMR } from '../../hmr'
import type { RpcServerOptions } from '../helper'
import type { Meta } from '../../meta'

const debug = Debug('phecda-server/nats')

export interface NatsCtx extends RpcContext {
  type: 'nats'
  msg: any

}

export async function bind(nc: NatsConnection, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts?: RpcServerOptions) {
  const { globalGuards = [], globalInterceptors = [] } = opts || {}
  const sc = StringCodec()
  const subscriptionMap: Record<string, Subscription> = {}

  const metaMap = new Map<string, Record<string, Meta>>()
  const existQueue = new Set<string>()
  function handleMeta() {
    metaMap.clear()
    for (const item of meta) {
      const { tag, func, rpc } = item.data
      if (!rpc)
        continue

      if (metaMap.has(tag))
        metaMap.get(tag)![func] = item

      else
        metaMap.set(tag, { [func]: item })
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
        subscriptionMap[queue] = nc.subscribe(queue, {
          queue,
          async callback(_, msg) {
            const data = JSON.parse(sc.decode(msg.data))
            const { tag, func, args, id } = data
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
          },
        })
      }
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
