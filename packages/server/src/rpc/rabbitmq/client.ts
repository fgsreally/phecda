import { EventEmitter } from 'events'
import type amqplib from 'amqplib'
import type { ToClientMap } from '../../types'
import { genClientQueue } from '../helper'

let eventId = 1
export async function createClient<S extends Record<string, any>>(ch: amqplib.Channel, controllers: S, opts?: { timeout?: number }) {
  const ret = {} as ToClientMap<S>
  const emitter = new EventEmitter()

  const clientQueue = genClientQueue()

  await ch.assertQueue(clientQueue)
  ch.consume(clientQueue, (msg) => {
    if (!msg)
      return
    const { data, id, error } = JSON.parse(msg.content.toString())
    emitter.emit(id, data, error)
  })

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

          ch.sendToQueue(queue, Buffer.from(
            JSON.stringify(
              {
                id,
                args,
                tag,
                queue: clientQueue,
                method: p,
              },
            ),
          ))
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

  return ret
}
