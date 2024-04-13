import { EventEmitter } from 'events'
import { randomUUID } from 'crypto'
import type { Consumer, Producer } from 'kafkajs'
import type { ToClientMap } from '../../types'
export async function createClient<S extends Record<string, any>>(producer: Producer, consumer: Consumer, controllers: S): Promise<ToClientMap<S>> {
  await producer.connect()
  await consumer.connect()

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
        if (!rpc.includes('*') && !rpc.includes('kafka'))
          throw new Error(`"${p}" in "${i}" doesn't support kafka`)
        return async (...args: any) => {
          const queue = genQueue(tag)
          const returnQueue = genReturnQueue(queue)
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
                  method: p,
                  args,
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
