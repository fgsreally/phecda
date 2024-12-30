/* eslint-disable no-new */

import type { Queue, QueueOptions, WorkerOptions } from 'bullmq'
import { RpcAdapter } from './client'

export function BullmqAdaptor(bullmqOptions?: {
  workerOpts?: WorkerOptions
  queueOpts?: QueueOptions
}): RpcAdapter {
  return async ({ clientQueue, receive }) => {
    const { Queue, Worker } = await import('bullmq')

    const queueMap: Record<string, Queue> = {}

    new Worker(clientQueue, async (job) => {
      receive(job.data)
    }, bullmqOptions?.workerOpts)
    return {
      send: ({ queue, data }) => {
        if (!(queue in queueMap))
          queueMap[queue] = new Queue(queue, bullmqOptions?.queueOpts)

        queueMap[queue].add(`${data.tag}-${data.func}`, data)
      },
    }
  }
}
