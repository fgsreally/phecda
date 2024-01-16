import { EventEmitter } from 'events'
import { randomUUID } from 'crypto'
import type amqplib from 'amqplib'
import type { ToControllerMap } from '../../types'
export async function createClient<S extends Record<string, any>>(ch: amqplib.Channel, queue: string, controllers: S): Promise<ToControllerMap<S>> {
  const ret = {} as any
  const emitter = new EventEmitter()
  const uniQueue = `PS:${randomUUID()}`

  await ch.assertQueue(uniQueue)
  ch.consume(uniQueue, (msg) => {
    if (!msg)
      return
    const { data, id, error } = JSON.parse(msg.content.toString())
    emitter.emit(id, data, error)
  })

  for (const i in controllers) {
    ret[i] = new Proxy(new controllers[i](), {
      get(target, p: string) {
        const id = randomUUID()
        if (typeof target[p] !== 'function')
          throw new Error(`"${p}" in "${i}" is not an exposed rpc `)

        const { tag, rpc, isEvent } = target[p]()
        if (!rpc.includes('mq'))
          throw new Error(`"${p}" in "${i}" doesn't support rabbitmq`)
        return (...args: any) => {
          ch.sendToQueue(queue, Buffer.from(
            JSON.stringify(
              {
                id,
                tag,
                args,
                queue: isEvent ? undefined : uniQueue,
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
