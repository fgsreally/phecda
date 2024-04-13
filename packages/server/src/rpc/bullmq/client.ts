import { EventEmitter } from 'events'
import { randomUUID } from 'crypto'
import { type Queue, Worker } from 'bullmq'
import type { ToClientMap } from '../../types'
export async function createClient<S extends Record<string, any>>(Queue: Queue, controllers: S): Promise<ToClientMap<S>> {
  const ret = {} as any
  const emitter = new EventEmitter()
  const existQueue = new Set<string>()

  const genQueue = (name: string) => `PS:${name}`
  const genReturnQueue = (name: string) => `PS:${name}/return`

  for (const i in controllers) {
    ret[i] = new Proxy(new controllers[i](), {
      get(target, p: string) {
        if (typeof target[p] !== 'function')
          throw new Error(`"${p}" in "${i}" is not an exposed rpc `)

        const { tag, rpc, isEvent } = target[p]()
        if (!rpc.includes('*') && !rpc.includes('bullmq'))
          throw new Error(`"${p}" in "${i}" doesn't support bullmq`)
        return async (...args: any) => {
          const queue = genQueue(tag)
          const returnQueue = genReturnQueue(queue)

          if (!existQueue.has(queue)) {
            existQueue.add(queue)

            if (!isEvent) {
              if (!existQueue.has(returnQueue)
              ) {
                existQueue.add(returnQueue)
                // eslint-disable-next-line no-new
                new Worker(returnQueue, async (job) => {
                  const { data, id, error } = job.data
                  emitter.emit(id!, data, error)
                })
              }
            }
          }

          const id = randomUUID()
          Queue.add(queue, {
            id,
            tag,
            args,
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
