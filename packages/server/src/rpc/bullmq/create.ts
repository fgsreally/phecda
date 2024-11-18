import type { Job, QueueOptions, WorkerOptions } from 'bullmq'
import { Queue, Worker } from 'bullmq'
import Debug from 'debug'
import type { Factory } from '../../core'
import { Context } from '../../context'
import type { RpcCtx, RpcServerOptions } from '../types'
import { HMR } from '../../hmr'

import { createControllerMetaMap, detectAopDep } from '../../helper'

const debug = Debug('phecda-server/bullmq')

export interface BullmqCtx extends RpcCtx {
  type: 'bullmq'
}

export type BullmqOptions = Omit<RpcServerOptions, 'globalAddons'> & {
  workerOpts?: WorkerOptions
  queueOpts?: QueueOptions
}

export async function create({ moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts: BullmqOptions = {}) {
  const { globalGuards, globalFilter, globalPipe, workerOpts, queueOpts, defaultQueue } = opts

  const workerMap: Record<string, Worker> = {}
  const queueMap: Record<string, Queue> = {}
  const existQueue = new Set<string>()
  const metaMap = createControllerMetaMap(meta, (meta) => {
    const { controller, rpc, func, tag } = meta.data
    if (controller === 'rpc' && rpc?.queue !== undefined) {
      debug(`register method "${func}" in module "${tag}"`)
      return true
    }
  })

  detectAopDep(meta, {
    guards: globalGuards,
  }, 'rpc')

  async function subscribeQueues() {
    existQueue.clear()
    for (const [tag, record] of metaMap) {
      for (const func in record) {
        const meta = metaMap.get(tag)![func]

        const {
          data: {
            rpc,
            addons,
          },
        } = meta

        if (rpc) {
          const queue = rpc.queue || defaultQueue || tag
          if (existQueue.has(queue))
            continue
          existQueue.add(queue)
          workerMap[queue] = new Worker(queue, handleRequest, workerOpts)

          Context.applyAddons(addons, workerMap[queue], 'bullmq')
        }
      }
    }
  }

  async function handleRequest(job: Job) {
    const { data } = job
    const { tag, func, args, id, queue: clientQueue, _ps } = data
    if (_ps !== 1)
      return
    debug(`invoke method "${func}" in module "${tag}"`)
    const meta = metaMap.get(tag)![func]

    const {
      data: {

        rpc: { isEvent } = {},
      },
    } = meta

    if (!isEvent && !(clientQueue in queueMap))
      queueMap[clientQueue] = new Queue(clientQueue, queueOpts)

    const aop = Context.getAop(meta, {
      globalFilter,
      globalGuards,
      globalPipe,
    })
    const context = new Context<BullmqCtx>({
      type: 'bullmq',
      category: 'rpc',
      moduleMap,
      meta,
      tag,
      func,
      data,
      args,
      id,
      queue: job.queueName,
      isEvent,
    })

    await context.run(aop, (returnData) => {
      if (!isEvent)

        queueMap[clientQueue].add(`${tag}-${func}`, { data: returnData, id })
    }, (err) => {
      if (!isEvent) {
        queueMap[clientQueue].add(`${tag}-${func}`, {
          data: err,
          error: true,
          id,
        })
      }
    })
  }

  subscribeQueues()

  HMR(async () => {
    for (const i in workerMap)
      await workerMap[i].close(true)
    for (const i in queueMap)
      await queueMap[i].close()

    await subscribeQueues()
  })

  return { workerMap, queueMap }
}
