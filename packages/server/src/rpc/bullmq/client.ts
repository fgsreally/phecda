/* eslint-disable no-new */
/* eslint-disable prefer-promise-reject-errors */
import { EventEmitter } from 'events'
import { Queue, Worker } from 'bullmq'
import type { ToClientMap } from '../../types'
import type { RpcClientOptions } from '../helper'
import { genClientQueue } from '../helper'
import { BullmqOptions } from './bind'

export async function createClient<S extends Record<string, any>>(controllers: S, opts: RpcClientOptions & BullmqOptions = {}) {
  let eventId = 1
  let eventCount = 0
  const { max, workerOpts, queueOpts, timeout, key } = opts
  const ret = {} as ToClientMap<S>
  const emitter = new EventEmitter()

  const clientQueue = genClientQueue(key)

  const queueMap: Record<string, Queue> = {}

  new Worker(clientQueue, async (job) => {
    const { data, id, error } = job.data
    emitter.emit(id, data, error)
  }, workerOpts)

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
            queueMap[queue] = new Queue(queue, queueOpts)

          const id = `${eventId++}`

          queueMap[queue].add(`${tag}-${p}`, {
            _ps: 1,
            id,
            args,
            tag,
            queue: clientQueue,
            func: p,
          })

          if (isEvent)
            return null

          return new Promise((resolve, reject) => {
            if (max && eventCount >= max)
              reject({ type: 'exceeded' })

            let isEnd = false
            const timer = setTimeout(() => {
              if (!isEnd) {
                eventCount--
                emitter.off(id, listener)
                reject({ type: 'timeout' })
              }
            }, timeout || 5000)

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
