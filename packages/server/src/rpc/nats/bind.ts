import NATS, { NatsConnection } from 'nats'
import type { Factory } from '../../core'
import { Context, detectAopDep } from '../../context'
import type { P } from '../../types'
import { HMR } from '../../hmr'
import type { RpcServerOptions } from '../helper'
import { genClientQueue } from '../helper'
import type { Meta } from '../../meta'

export interface NatsCtx extends P.BaseContext {
  type: 'nats'

  data: any
}

export async function bind(nc: NatsConnection, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts?: RpcServerOptions) {
  const { globalGuards = [], globalInterceptors = [] } = opts || {}

  const metaMap = new Map<string, Record<string, Meta>>()
  const existQueue = new Set<string>()
  function handleMeta() {
    metaMap.clear()
    for (const item of meta) {
      const { tag, method, rpc, guards, interceptors } = item.data
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

        nc.subscribe(queue, handleRequest)
      }
    }
  }

  async function handleRequest(msg: string) {
    const data = JSON.parse(msg)
    const { tag, method, args, id, queue: clientQueue } = data

    const meta = metaMap.get(tag)![method]

    const {
      data: { rpc: { isEvent } = {}, guards, interceptors, params, name, filter, ctx },
      paramsType,
    } = meta

    const context = new Context<NatsCtx>({
      type: 'nats',
      moduleMap,
      meta,
      tag,
      method,
      data,

      msg,
    })

    try {
      await context.useGuard([...globalGuards, ...guards])
      const cache = await context.useInterceptor([...globalInterceptors, ...interceptors])
      if (cache !== undefined) {
        if (!isEvent)
          ch.sendToQueue(clientQueue, Buffer.from(JSON.stringify({ data: cache, id })))

        return
      }
      const handleArgs = await context.usePipe(params.map(({ type, key, pipe, pipeOpts, index }, i) => {
        return { arg: args[i], pipe, pipeOpts, key, type, index, reflect: paramsType[index] }
      }))

      const instance = moduleMap.get(name)
      if (ctx)
        instance[ctx] = context.data
      const funcData = await instance[method](...handleArgs)

      const ret = await context.usePostInterceptor(funcData)
      if (!isEvent)
        ch.sendToQueue(clientQueue, Buffer.from(JSON.stringify({ data: ret, id })))
    }
    catch (e) {
      const ret = await context.useFilter(e, filter)
      if (!isEvent) {
        ch.sendToQueue(clientQueue, Buffer.from(JSON.stringify({
          data: ret,
          error: true,
          id,
        })))
      }
    }
  }

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
      await ch.deleteQueue(queue)
    existQueue.clear()
    await subscribeQueues()
  })
}
