import { randomUUID } from 'crypto'
import { EventEmitter } from 'events'
import Redis from 'ioredis'
import type { ToInstance } from '../types'

export function createClient<S extends Record<string, any>>(redis: Redis, queue: string, controllers: S): ToInstance<S> {
  const ret = {} as any
  const sub = new Redis(redis.options)
  const uniQueue = randomUUID()

  const emitter = new EventEmitter()
  sub.subscribe(uniQueue)

  sub.on('message', (_, msg) => {
    const { data, id } = JSON.parse(msg)
    emitter.emit(id, data)
  })

  for (const i in controllers) {
    ret[i] = new Proxy(new controllers[i](), {
      get(target, p) {
        return (...args: any) => {
          const id = randomUUID()
          const { tag } = target[p]()

          return new Promise((resolve, reject) => {
            emitter.once(id, (data) => {
              if (data?.error)
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
