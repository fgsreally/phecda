/* eslint-disable no-new */

import type { Queue, QueueOptions, WorkerOptions } from 'bullmq'
import { RpcAdapter } from './client'

export function adaptor(bullmqOptions?: {
  workerOpts?: WorkerOptions
  queueOpts?: QueueOptions
}): RpcAdapter {
  return ({ clientQueue, receive }) => {
    const queueMap: Record<string, Queue> = {}
    let BullQueue: typeof Queue
    return {
      async init() {
        const { Queue, Worker } = await import('bullmq')
        BullQueue = Queue

        new Worker(clientQueue, async (job) => {
          receive(job.data)
        }, bullmqOptions?.workerOpts)
      },
      send: ({ queue, data }) => {
        if (!(queue in queueMap))
          queueMap[queue] = new BullQueue(queue, bullmqOptions?.queueOpts)

        queueMap[queue].add(`${data.tag}-${data.func}`, data)
      },
    }
  }
}
