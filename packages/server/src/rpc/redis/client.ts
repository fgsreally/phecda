import { randomUUID } from 'crypto'
import EventEmitter from 'events'
import type Redis from 'ioredis'
import type { ToClientMap } from '../../types'
import { generateReturnQueue } from '../helper'

export function createClient<S extends Record<string, any>>(pub: Redis, sub: Redis, controllers: S, opts?: { timeout?: number }): ToClientMap<S> {
  const ret = {} as any

  const existQueue = new Set<string>()
  const emitter = new EventEmitter()

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
            tag,
            method: p,
          }))
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
