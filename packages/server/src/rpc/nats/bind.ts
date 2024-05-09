import type { NatsConnection, Subscription } from 'nats'
import { StringCodec } from 'nats'
import Debug from 'debug'
import type { Factory } from '../../core'
import { Context, detectAopDep } from '../../context'
import type { P } from '../../types'
import { HMR } from '../../hmr'
import type { RpcServerOptions } from '../helper'
import type { Meta } from '../../meta'

const debug = Debug('phecda-server/nats')

export interface NatsCtx extends P.BaseContext {
  type: 'nats'
  msg: any
  data: any
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

            if (isEvent)
              msg.respond('{}')

            const context = new Context<NatsCtx>({
              type: 'nats',
              moduleMap,
              meta,
              tag,
              func,
              data,
              msg,
            })

            try {
              await context.useGuard([...globalGuards, ...guards])
              const cache = await context.useInterceptor([...globalInterceptors, ...interceptors])
              if (cache !== undefined) {
                if (!isEvent)
                  msg.respond(sc.encode(JSON.stringify({ data: cache, id })))

                return
              }
              const handleArgs = await context.usePipe(params.map(({ type, key, pipe, pipeOpts, index }, i) => {
                return { arg: args[i], pipe, pipeOpts, key, type, index, reflect: paramsType[index] }
              }))

              const instance = moduleMap.get(name)
              if (ctx)
                instance[ctx] = context.data
              const funcData = await instance[func](...handleArgs)

              const ret = await context.usePostInterceptor(funcData)
              if (!isEvent)
                msg.respond(sc.encode(JSON.stringify({ data: ret, id })))
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
