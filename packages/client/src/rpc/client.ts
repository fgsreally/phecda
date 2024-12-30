/* eslint-disable prefer-promise-reject-errors */
import EventEmitter from 'events'
import { RpcRequest } from '../utils'
import type { RpcClientMap } from '../types'
import { type RpcClientOptions, genClientQueue } from './utils'

export type RpcAdapter = (arg: {
  clientQueue: string
  receive: (data: any) => void
}) => Promise<{
  send: (arg: {
    queue: string
    data: any

    resolve: (value: any) => void
    reject: (reason?: any) => void
  }) => void
}>

export async function createClient<Controllers extends Record<string, any>>(controllers: Controllers, adapter: RpcAdapter, opts?: RpcClientOptions) {
  const ret = {} as RpcClientMap<Controllers>
  let eventId = 1
  let eventCount = 0
  const emitter = new EventEmitter()
  const clientQueue = genClientQueue(opts?.key)
  const { send } = await adapter({
    clientQueue,
    receive: (data) => {
      emitter.emit(data.id, data.data, data.error)
    },
  })

  for (const i in controllers) {
    ret[i] = new Proxy(new controllers[i](), {
      get(target, p: string) {
        if (typeof target[p] !== 'function')
          throw new Error(`"${p}" in "${i}" is not an exposed rpc `)

        let { tag, queue, isEvent } = target[p]()

        return (...args: any) => {
          return RpcRequest(() => {
            if (!queue)
              queue = tag

            const id = `${eventId++}`

            return new Promise((resolve, reject) => {
              send({
                queue,
                data: {
                  _ps: 1,
                  args,
                  id,
                  queue: clientQueue,
                  tag,
                  func: p,
                },
                resolve,
                reject,
              })

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
