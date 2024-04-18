/* eslint-disable prefer-promise-reject-errors */
import EventEmitter from 'events'
import { randomUUID } from 'crypto'
import type Redis from 'ioredis'
import type { ToClientMap } from '../../types'
import type { RpcClientOptions } from '../helper'
import { genClientQueue } from '../helper'

export async function createClient<S extends Record<string, any>>(pub: Redis, sub: Redis, controllers: S, opts?: RpcClientOptions) {
  const ret = {} as ToClientMap<S>
  const prefix = opts?.prefix || (`${randomUUID()}:`)
  let eventId = 1
  let eventCount = 0
  const emitter = new EventEmitter()
  const clientQueue = genClientQueue()

  await sub.subscribe(clientQueue)

  for (const i in controllers) {
    ret[i] = new Proxy(new controllers[i](), {
      get(target, p: string) {
        if (typeof target[p] !== 'function')
          throw new Error(`"${p}" in "${i}" is not an exposed rpc `)

        let { tag, queue, isEvent } = target[p]()

        return async (...args: any) => {
          if (!queue)
            queue = tag

          const id = `${prefix}${eventId++}`

          pub.publish(queue, JSON.stringify({
            args,
            id,
            queue: clientQueue,
            tag,
            method: p,
          }))
          if (isEvent)
            return null

          return new Promise((resolve, reject) => {
            if (opts?.max && eventCount >= opts.max)
              reject({ type: 'exceeded' })

            let isEnd = false
            const timer = setTimeout(() => {
              if (!isEnd) {
                eventCount--
                emitter.off(id, listener)
                reject({ type: 'timeout' })
              }
            }, opts?.timeout || 5000)

            function listener(data: any, error: boolean) {
              eventCount--
              isEnd = true
              clearTimeout(timer)
              if (error)
                reject(data)

              else
                resolve(data)
            }
            eventCount++
            emitter.once(id, listener)
          })
        }
      },
    })
  }

  sub.on('message', async (channel, msg) => {
    if (channel === clientQueue && msg) {
      const { data, id, error } = JSON.parse(msg)

      emitter.emit(id, data, error)
    }
  })

  return ret
}
