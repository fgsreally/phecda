import { EventEmitter } from 'events'
import { randomUUID } from 'crypto'
import type { Kafka } from 'kafkajs'
import type { ToClientMap } from '../../types'
export async function createClient<S extends Record<string, any>>(kafka: Kafka, topic: string, controllers: S): Promise<ToClientMap<S>> {
  const ret = {} as any
  const emitter = new EventEmitter()
  const uniQueue = `PS:${topic}-${randomUUID()}`
  const producer = kafka.producer()
  await producer.connect()

  const consumer = kafka.consumer({ groupId: 'phecda-server' })
  await consumer.connect()

  await consumer.subscribe({ topic: uniQueue, fromBeginning: true })

  await consumer.run(
    {
      eachMessage: async ({ message }) => {
        if (!message.value)
          return
        const { data, id, error } = JSON.parse(message.value.toString())
        emitter.emit(id, data, error)
      },
    },
  )

  for (const i in controllers) {
    ret[i] = new Proxy(new controllers[i](), {
      get(target, p: string) {
        if (typeof target[p] !== 'function')
          throw new Error(`"${p}" in "${i}" is not an exposed rpc `)

        const { tag, rpc, isEvent } = target[p]()
        if (!rpc.includes('kafka'))
          throw new Error(`"${p}" in "${i}" doesn't support kafka`)
        return (...args: any) => {
          const id = randomUUID()

          producer.send({
            topic,
            messages: [
              {
                value: JSON.stringify({
                  id,
                  tag,
                  args,
                  queue: isEvent ? undefined : uniQueue,
                }),
              },
            ],
          })

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
