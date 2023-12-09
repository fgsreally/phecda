import { randomUUID } from 'crypto'
import EventEmitter from 'events'
import Redis from 'ioredis'
import type { ToInstance } from '../../types'

export function createClient<S extends Record<string, any>>(redis: Redis, queue: string, controllers: S): ToInstance<S> {
  const ret = {} as any
  const sub = new Redis(redis.options)
  const uniQueue = randomUUID()

  const emitter = new EventEmitter()
  sub.subscribe(uniQueue)

  sub.on('message', (_, msg) => {
    const { data, id, error } = JSON.parse(msg)
    emitter.emit(id, data, error)
  })

  for (const i in controllers) {
    ret[i] = new Proxy(new controllers[i](), {
      get(target, p: string) {
        return (...args: any) => {
          const id = randomUUID()
          if (typeof target[p] !== 'function')
            throw new Error(`"${p}" in "${i}" is not an exposed rpc `)

          const { tag, rpc } = target[p]()
          if (!rpc.includes('redis'))
            throw new Error(`"${p}" in "${i}" doesn't support redis`)

          return new Promise((resolve, reject) => {
            emitter.once(id, (data, error) => {
              if (error)
                reject(data)

              else
                resolve(data)
            })

            redis.publish(queue, JSON.stringify({
              args,
              id,
              tag,
              queue: uniQueue,
            }))
          })
        }
      },
    })
  }

  return ret
}
