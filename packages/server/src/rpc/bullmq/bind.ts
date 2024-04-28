import type { ConnectionOptions } from 'bullmq'
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

export async function bind(connectOpts: ConnectionOptions, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts?: RpcServerOptions) {
  const { globalGuards = [], globalInterceptors = [] } = opts || {}

  const metaMap = new Map<string, Record<string, Meta>>()
  const workerMap: Record<string, Worker> = {}
  const queueMap: Record<string, Queue> = {}
  const existQueue = new Set<string>()
  function handleMeta() {
    metaMap.clear()
    for (const item of meta) {
      const { tag, func, rpc, guards, interceptors } = item.data
      if (!rpc)
        continue
      detectAopDep(meta, {
        guards,
        interceptors,
      })
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
        workerMap[queue] = new Worker(queue, async (job) => {
          const { data } = job
          const { tag, func, args, id, queue: clientQueue } = data

          const meta = metaMap.get(tag)![func]

          const {
            data: { rpc: { isEvent } = {}, guards, interceptors, params, name, filter, ctx },
            paramsType,
          } = meta

          if (!isEvent && !(clientQueue in queueMap))
            queueMap[clientQueue] = new Queue(clientQueue, { connection: connectOpts })

          const context = new Context<BullmqCtx>({
            type: 'bullmq',
            moduleMap,
            meta,
            tag,
            func,
            data,

          })

          try {
            await context.useGuard([...globalGuards, ...guards])
            const cache = await context.useInterceptor([...globalInterceptors, ...interceptors])
            if (cache !== undefined) {
              if (!isEvent)
                queueMap[clientQueue].add(`${tag}-${func}`, { data: cache, id })

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
              queueMap[clientQueue].add(`${tag}-${func}`, { data: ret, id })
          }
          catch (e) {
            const ret = await context.useFilter(e, filter)
            if (!isEvent) {
              queueMap[clientQueue].add(`${tag}-${func}`, {
                data: ret,
                error: true,
                id,
              })
            }
          }
        }, { connection: connectOpts })
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
    for (const i in workerMap)
      await workerMap[i].close(true)
    for (const i in queueMap)
      await queueMap[i].close()

    await subscribeQueues()
  })

  return { workerMap, queueMap }
}
