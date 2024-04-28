/* eslint-disable no-new */
/* eslint-disable prefer-promise-reject-errors */
import { EventEmitter } from 'events'
import type { ConnectionOptions } from 'bullmq'
import { Queue, Worker } from 'bullmq'
import type { ToClientMap } from '../../types'
import type { RpcClientOptions } from '../helper'
import { genClientQueue } from '../helper'

export async function createClient<S extends Record<string, any>>(connectOpts: ConnectionOptions, controllers: S, opts?: RpcClientOptions) {
  let eventId = 1
  let eventCount = 0

  const ret = {} as ToClientMap<S>
  const emitter = new EventEmitter()

  const clientQueue = genClientQueue(opts?.key)

  const queueMap: Record<string, Queue> = {}

  new Worker(clientQueue, async (job) => {
    const { data, id, error } = job.data
    emitter.emit(id, data, error)
  }, { connection: connectOpts })

  for (const i in controllers) {
    ret[i] = new Proxy(new controllers[i](), {
      get(target, p: string) {
        if (typeof target[p] !== 'function')
          throw new Error(`"${p}" in "${i}" is not an exposed rpc `)

        let { tag, queue, isEvent } = target[p]()

        return async (...args: any) => {
          if (!queue)
            queue = tag
          if (!(queue in queueMap))
            queueMap[queue] = new Queue(queue, { connection: connectOpts })

          const id = `${eventId++}`

          queueMap[queue].add(`${tag}-${p}`, {
            id,
            args,
            tag,
            queue: clientQueue,
            func: p,
          })

          if (isEvent)
            return null

          return new Promise((resolve, reject) => {
            if (opts?.max && eventCount >= opts.max)
              reject({ type: 'exceeded' })

            let isEnd = false
            const timer = setTimeout(() => {
              if (!isEnd) {
                eventCount--
                emitter.off(id, listener)
                reject({ type: 'timeout' })
              }
            }, opts?.timeout || 5000)

            function listener(data: any, error: boolean) {
              eventCount--
              isEnd = true
              clearTimeout(timer)
              if (error)
                reject(data)

              else
                resolve(data)
            }
            eventCount++
            emitter.once(id, listener)
          })
        }
      },
    })
  }

  return ret
}
