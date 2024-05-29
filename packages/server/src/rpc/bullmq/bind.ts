import type { ConnectionOptions, Job } from 'bullmq'
import { Queue, Worker } from 'bullmq'
import Debug from 'debug'
import type { Factory } from '../../core'
import { Context, detectAopDep } from '../../context'
import type { RpcContext } from '../../types'
import { HMR } from '../../hmr'
import type { RpcServerOptions } from '../helper'
import type { ControllerMeta } from '../../meta'

const debug = Debug('phecda-server/bullmq')

export interface BullmqCtx extends RpcContext {
  type: 'bullmq'
}

export async function bind(connectOpts: ConnectionOptions, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts?: RpcServerOptions) {
  const { globalGuards = [], globalInterceptors = [] } = opts || {}

  const metaMap = new Map<string, Record<string, ControllerMeta>>()
  const workerMap: Record<string, Worker> = {}
  const queueMap: Record<string, Queue> = {}
  const existQueue = new Set<string>()
  function handleMeta() {
    metaMap.clear()
    for (const item of meta) {
      const { tag, func, controller, rpc } = item.data
      if (controller !== 'rpc' || rpc?.queue === undefined)
        continue
      item.data.guards = [...globalGuards, ...item.data.guards]
      item.data.interceptors = [...globalInterceptors, ...item.data.interceptors]

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
          workerMap[queue] = new Worker(queue, handleRequest, { connection: connectOpts })
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
      queueMap[clientQueue] = new Queue(clientQueue, { connection: connectOpts })

    const context = new Context<BullmqCtx>({
      type: 'bullmq',
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

    await context.run((returnData) => {
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
    for (const i in workerMap)
      await workerMap[i].close(true)
    for (const i in queueMap)
      await queueMap[i].close()

    await subscribeQueues()
  })

  return { workerMap, queueMap }
}
