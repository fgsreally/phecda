/* eslint-disable prefer-promise-reject-errors */
import EventEmitter from 'eventemitter3'
import { nanoid } from 'nanoid'
import { RpcRequest } from '../utils'
import type { RpcClientMap } from '../types'
export interface RpcClientOptions {
  // add to clientQueue
  genClientQueue?: (key?: string) => string
  timeout?: number
  max?: number
}

export type RpcAdapter = (arg: {
  clientQueue: string
  receive: (data: any) => void
}) => {
  send: (arg: {
    queue: string
    data: any
    isEvent: boolean
    resolve: (value: any) => void
    reject: (reason?: any) => void
  }) => void | true
  init?: () => Promise<void> | void
}

export function createClient<Controllers extends Record<string, any>>(controllers: Controllers, adapter: RpcAdapter, opts?: RpcClientOptions) {
  const { genClientQueue = nanoid } = opts || {}
  const ret = {} as RpcClientMap<Controllers>
  let eventId = 1
  let eventCount = 0
  const emitter = new EventEmitter()
  const clientQueue = genClientQueue()
  const { send, init } = adapter({
    clientQueue,
    receive: (data) => {
      emitter.emit(data.id, data.data, data.error)
    },
  })

  let initPromise = init?.()

  for (const i in controllers) {
    ret[i] = new Proxy(new controllers[i](), {
      get(target, p: string) {
        if (typeof target[p] !== 'function')
          throw new Error(`"${p}" in "${i}" is not an exposed rpc `)

        let { tag, queue, isEvent } = target[p]()

        return (...args: any) => {
          return RpcRequest(async () => {
            if (!queue)
              queue = tag

            if (initPromise) {
              await initPromise
              initPromise = undefined
            }

            const id = `${eventId++}`

            return new Promise((resolve, reject) => {
              const isIntercept = send({
                isEvent,
                queue,
                data: {
                  _ps: 1,
                  args,
                  id,
                  queue: clientQueue,
                  tag,
                  method: p,
                },
                resolve,
                reject,
              })
              if (isIntercept)

                return

              if (isEvent)
                return resolve(null)

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
          })
        }
      },
    })
  }

  return ret
}
