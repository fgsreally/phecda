import { randomUUID } from 'crypto'
import EventEmitter from 'events'
import type Redis from 'ioredis'
import type { ToClientMap } from '../../types'

export function createClient<S extends Record<string, any>>(pub: Redis, sub: Redis, controllers: S, opts?: { timeout?: number }): ToClientMap<S> {
  const ret = {} as any
  const genQueue = (name: string) => `PS:${name}`
  const genReturnQueue = (name: string) => `${name}/return`
  const existQueue = new Set<string>()
  const emitter = new EventEmitter()

  for (const i in controllers) {
    ret[i] = new Proxy(new controllers[i](), {
      get(target, p: string) {
        if (typeof target[p] !== 'function')
          throw new Error(`"${p}" in "${i}" is not an exposed rpc `)

        const { tag, rpc, isEvent } = target[p]()
        if (!rpc.includes('*') && !rpc.includes('redis'))
          throw new Error(`"${p}" in "${i}" doesn't support redis`)
        return async (...args: any) => {
          const queue = genQueue(tag)
          const returnQueue = genReturnQueue(queue)

          if (!isEvent) {
            if (!existQueue.has(returnQueue)
            ) {
              existQueue.add(returnQueue)
              await sub.subscribe(returnQueue)
            }
          }

          const id = isEvent ? '' : randomUUID()

          pub.publish(queue, JSON.stringify({
            args,
            id,
            method: p,
          }))
          if (isEvent)
            return null

          return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
              emitter.off(id, listener)
              reject({ message: 'timeout' } as any)
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

  sub.on('message', async (channel, msg) => {
    if (existQueue.has(channel)) {
      if (!msg)
        return
      const { data, id, error } = JSON.parse(msg)

      emitter.emit(id, data, error)
    }
  })

  return ret
}
