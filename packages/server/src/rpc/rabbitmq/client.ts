import { EventEmitter } from 'events'
import { randomUUID } from 'crypto'
import type amqplib from 'amqplib'
import type { ToClientMap } from '../../types'
export async function createClient<S extends Record<string, any>>(ch: amqplib.Channel, controllers: S): Promise<ToClientMap<S>> {
  const ret = {} as any
  const emitter = new EventEmitter()
  const genQueue = (name: string) => `PS:${name}`
  const genReturnQueue = (name: string) => `${name}/return`
  const existQueue = new Set<string>()

  for (const i in controllers) {
    ret[i] = new Proxy(new controllers[i](), {
      get(target, p: string) {
        if (typeof target[p] !== 'function')
          throw new Error(`"${p}" in "${i}" is not an exposed rpc `)

        const { tag, rpc, isEvent } = target[p]()
        if (!rpc.includes('*') && !rpc.includes('rabbitmq'))
          throw new Error(`"${p}" in "${i}" doesn't support rabbitmq`)

        return async (...args: any) => {
          const queue = genQueue(tag)
          const returnQueue = genReturnQueue(queue)

          // if (!existQueue.has(queue)) {
          //   existQueue.add(queue)
          //   await ch.assertQueue(queue)

          // }
          if (!isEvent && !existQueue.has(returnQueue)) {
            existQueue.add(returnQueue)
            await ch.assertQueue(returnQueue)
            ch.consume(returnQueue, (msg) => {
              if (!msg)
                return
              const { data, id, error } = JSON.parse(msg.content.toString())
              emitter.emit(id, data, error)
            })
          }
          const id = isEvent ? '' : randomUUID()

          ch.sendToQueue(queue, Buffer.from(
            JSON.stringify(
              {
                id,
                args,
                method: p,
              },
            ),
          ))
          if (isEvent)
            return null

          return new Promise((resolve, reject) => {
            emitter.once(id, (data: any, error: boolean) => {
              if (error)
                reject(data)

              else resolve(data)
            })
          })
        }
      },
    })
  }

  return ret
}
