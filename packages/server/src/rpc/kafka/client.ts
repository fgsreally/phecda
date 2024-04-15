import { EventEmitter } from 'events'
import { randomUUID } from 'crypto'
import type { Consumer, Producer } from 'kafkajs'
import type { ToClientMap } from '../../types'
import { generateReturnQueue } from '../helper'
export async function createClient<S extends Record<string, any>>(producer: Producer, consumer: Consumer, controllers: S, opts?: { timeout?: number }): Promise<ToClientMap<S>> {
  await producer.connect()
  await consumer.connect()

  const ret = {} as any
  const emitter = new EventEmitter()

  const existQueue = new Set<string>()

  for (const i in controllers) {
    ret[i] = new Proxy(new controllers[i](), {
      get(target, p: string) {
        if (typeof target[p] !== 'function')
          throw new Error(`"${p}" in "${i}" is not an exposed rpc `)

        let { tag, queue, isEvent } = target[p]()

        return async (...args: any) => {
          if (!queue)
            queue = tag
          const returnQueue = generateReturnQueue(queue)
          if (!isEvent && !existQueue.has(returnQueue)) {
            existQueue.add(returnQueue)

            await consumer.subscribe({ topic: queue, fromBeginning: true })
          }
          const id = isEvent ? '' : randomUUID()
          producer.send({
            topic: queue,
            messages: [
              {
                value: JSON.stringify({
                  id,
                  tag,
                  method: p,
                  args,
                }),
              },
            ],
          })

          if (isEvent)
            return null

          return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
              emitter.off(id, listener)
              // eslint-disable-next-line prefer-promise-reject-errors
              reject({ message: 'timeout' })
            }, opts?.timeout || 5000)

            function listener(data: any, error: boolean) {
              clearTimeout(timer)
              if (error)
                reject(data)

              else
                resolve(data)
            }
            emitter.once(id, listener)
          })
        }
      },
    })
  }
  await consumer.run(
    {
      eachMessage: async ({ message, topic }) => {
        if (!message.value || !existQueue.has(topic))
          return

        const { data, id, error } = JSON.parse(message.value.toString())

        emitter.emit(id, data, error)
      },
    },
  )

  return ret
}
