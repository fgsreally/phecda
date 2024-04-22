import { Queue, Worker } from 'bullmq'
import type { Factory } from '../../core'
import { Context, detectAopDep } from '../../context'
import type { P } from '../../types'
import { HMR } from '../../hmr'
import type { RpcServerOptions } from '../helper'
import type { Meta } from '../../meta'
export interface BullmqCtx extends P.BaseContext {
  type: 'bullmq'
  data: any
}

export async function bind({ moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts?: RpcServerOptions) {
  const { globalGuards = [], globalInterceptors = [] } = opts || {}

  const metaMap = new Map<string, Record<string, Meta>>()
  const workerMap: Record<string, Worker> = {}
  const queueMap: Record<string, Queue> = {}
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
        workerMap[queue] = new Worker(queue, async (job) => {
          const { data } = job
          const { tag, method, args, id, queue: clientQueue } = data

          const meta = metaMap.get(tag)![method]

          const {
            data: { rpc: { isEvent } = {}, guards, interceptors, params, name, filter, ctx },
            paramsType,
          } = meta

          if (!isEvent && !(clientQueue in queueMap))
            queueMap[clientQueue] = new Queue(clientQueue)

          const context = new Context<BullmqCtx>({
            type: 'bullmq',
            moduleMap,
            meta,
            tag,
            method,
            data,

          })

          try {
            await context.useGuard([...globalGuards, ...guards])
            const cache = await context.useInterceptor([...globalInterceptors, ...interceptors])
            if (cache !== undefined) {
              if (!isEvent)
                queueMap[clientQueue].add(`${tag}-${method}`, { data: cache, id })

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
              queueMap[clientQueue].add(`${tag}-${method}`, { data: ret, id })
          }
          catch (e) {
            const ret = await context.useFilter(e, filter)
            if (!isEvent) {
              queueMap[clientQueue].add(`${tag}-${method}`, {
                data: ret,
                error: true,
                id,
              })
            }
          }
        })
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

    existQueue.clear()
    await subscribeQueues()
  })

  return { workerMap, queueMap }
}
