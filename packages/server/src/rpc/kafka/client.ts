/* eslint-disable prefer-promise-reject-errors */
import { EventEmitter } from 'events'
import type { Consumer, Producer } from 'kafkajs'
import type { ToClientMap } from '../../types'
import type { RpcClientOptions } from '../helper'
import { genClientQueue } from '../helper'
// @experiment
export async function createClient<S extends Record<string, any>>(producer: Producer, consumer: Consumer, controllers: S, opts?: RpcClientOptions) {
  let eventId = 1
  let eventCount = 1

  const ret = {} as ToClientMap<S>
  const emitter = new EventEmitter()

  const clientQueue = genClientQueue(opts?.key)

  await consumer.subscribe({ topic: clientQueue, fromBeginning: true })
  for (const i in controllers) {
    ret[i] = new Proxy(new controllers[i](), {
      get(target, p: string) {
        if (typeof target[p] !== 'function')
          throw new Error(`"${p}" in "${i}" is not an exposed rpc `)

        let { tag, queue, isEvent } = target[p]()

        return async (...args: any) => {
          if (!queue)
            queue = tag

          const id = `${eventId++}`

          producer.send({
            topic: queue,
            messages: [
              {
                value: JSON.stringify({
                  id,
                  tag,
                  queue: clientQueue,
                  method: p,
                  args,
                }),
              },
            ],
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
  await consumer.run(
    {
      eachMessage: async ({ message, topic }) => {
        if (clientQueue === topic && message.value) {
          const { data, id, error } = JSON.parse(message.value.toString())

          emitter.emit(id, data, error)
        }
      },
    },
  )

  return ret
}
