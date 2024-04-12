import { EventEmitter } from 'events'
import { randomUUID } from 'crypto'
import type { Queue } from 'bullmq'
import type { ToClientMap } from '../../types'
import type { RpcOpts } from '../types'
export async function createClient<S extends Record<string, any>>(Queue: Queue, queue: string, controllers: S, opts?: RpcOpts): Promise<ToClientMap<S>> {
  const ret = {} as any
  const emitter = new EventEmitter()
  const uniQueue = opts?.queue ? `PS:${opts.queue}` : `PS:${queue}-${randomUUID()}`
  for (const i in controllers) {
    ret[i] = new Proxy(new controllers[i](), {
      get(target, p: string) {
        if (typeof target[p] !== 'function')
          throw new Error(`"${p}" in "${i}" is not an exposed rpc `)

        const { tag, rpc, isEvent } = target[p]()
        if (!rpc.includes('bullmq'))
          throw new Error(`"${p}" in "${i}" doesn't support bullmq`)
        return (...args: any) => {
          const id = randomUUID()
          Queue.add(queue, {
            id,
            tag,
            args,
            queue: isEvent ? undefined : uniQueue,
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
