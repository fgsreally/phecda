/* eslint-disable prefer-promise-reject-errors */
import { StringCodec } from 'nats'
import type { NatsConnection } from 'nats'
import type { ToClientMap } from '../../types'
import type { RpcClientOptions } from '../types'

export async function createClient<S extends Record<string, any>>(nc: NatsConnection, controllers: S, opts?: Omit<RpcClientOptions, 'key'>) {
  let eventId = 1
  let eventCount = 0
  const sc = StringCodec()

  const ret = {} as ToClientMap<S>

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
          const request = nc.request(queue, sc.encode(JSON.stringify({
            _ps: 1,

            id,
            args,
            tag,
            func: p,
          })))

          if (isEvent)
            return null

          return new Promise((resolve, reject) => {
            if (opts?.max && eventCount >= opts.max)
              reject({ type: 'exceeded' })
            // @todo still throw global promise reject
            request.catch(reject)
            request
              .then((msg) => {
                const { data, id, error } = msg.json() as any
                if (id)
                  handler(data, error)
              })

            let isEnd = false
            const timer = setTimeout(() => {
              if (!isEnd) {
                eventCount--
                reject({ type: 'timeout' })
              }
            }, opts?.timeout || 5000)

            function handler(data: any, error: boolean) {
              eventCount--
              isEnd = true
              clearTimeout(timer)
              if (error)
                reject(data)

              else
                resolve(data)
            }
            eventCount++
          })
        }
      },
    })
  }

  return ret
}
