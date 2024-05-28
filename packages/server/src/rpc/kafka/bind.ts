import type { Consumer, Producer } from 'kafkajs'
import Debug from 'debug'
import type { Factory } from '../../core'
import type { ControllerMeta } from '../../meta'
import { Context, detectAopDep } from '../../context'
import type { RpcContext } from '../../types'
import { HMR } from '../../hmr'
import type { RpcServerOptions } from '../helper'

const debug = Debug('phecda-server/kafka')

export interface KafkaCtx extends RpcContext {
  type: 'kafka'
  topic: string
  partition: number
  heartbeat(): Promise<void>
  pause(): () => void

}
// @experiment

export async function bind(consumer: Consumer, producer: Producer, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts?: RpcServerOptions) {
  const { globalGuards = [], globalInterceptors = [] } = opts || {}

  const metaMap = new Map<string, Record<string, ControllerMeta>>()
  const existQueue = new Set<string>()
  function handleMeta() {
    metaMap.clear()
    for (const item of meta) {
      const { tag, func, controller } = item.data
      if (controller !== 'rpc')
        continue

      if (metaMap.has(tag))
        metaMap.get(tag)![func] = item as ControllerMeta

      else
        metaMap.set(tag, { [func]: item as ControllerMeta })
    }
  }

  async function subscribeQueues() {
    existQueue.clear()

    for (const item of meta) {
      const {
        data: {
          rpc, tag,
        },
      } = item
      if (rpc) {
        const queue = rpc.queue || tag
        if (existQueue.has(queue))
          continue
        existQueue.add(queue)
        await consumer.subscribe({ topic: queue, fromBeginning: true })
      }
    }
  }

  detectAopDep(meta, {
    guards: globalGuards,
    interceptors: globalInterceptors,
  }, 'rpc')
  handleMeta()
  await subscribeQueues()
  await consumer.run({
    eachMessage: async ({ message, partition, topic, heartbeat, pause }) => {
      if (!existQueue.has(topic))
        return

      const data = JSON.parse(message.value!.toString())

      const { tag, func, args, id, queue: clientQueue } = data
      debug(`invoke method "${func}" in module "${tag}"`)
      const meta = metaMap.get(tag)![func]
      const {
        data: {
          guards, interceptors, params, name, filter, ctx, rpc,
        },
        paramsType,
      } = meta
      const isEvent = rpc!.isEvent

      const context = new Context<KafkaCtx>({
        type: 'kafka',
        moduleMap,
        meta,
        tag,
        func,
        partition,
        topic,
        heartbeat,
        pause,
        data,
        send(data) {
          if (!isEvent) {
            producer.send({
              topic: clientQueue,
              messages: [
                { value: JSON.stringify({ data, id }) },
              ],
            })
          }
        },
      })

      try {
        await context.useGuard([...globalGuards, ...guards])
        const i1 = await context.useInterceptor([...globalInterceptors, ...interceptors])
        if (i1 !== undefined)
          return i1

        const handleArgs = await context.usePipe(params.map((param, i) => {
          return { arg: args[i], reflect: paramsType[i], ...param }
        }))

        const instance = moduleMap.get(name)
        if (ctx)
          instance[ctx] = context.data
        const funcData = await instance[func](...handleArgs)

        const i2 = await context.usePostInterceptor(funcData)
        if (i2 !== undefined)
          return i2
        if (!isEvent) {
          producer.send({
            topic: clientQueue,
            messages: [
              { value: JSON.stringify({ data: funcData, id }) },
            ],
          })
        }
      }
      catch (e) {
        const ret = await context.useFilter(e, filter)
        if (!isEvent) {
          producer.send({
            topic: clientQueue,
            messages: [
              {
                value: JSON.stringify({
                  data: ret,
                  error: true,
                  id,
                }),
              },
            ],
          })
        }
      }
    },
  })

  HMR(async () => {
    detectAopDep(meta, {
      guards: globalGuards,
      interceptors: globalInterceptors,
    }, 'rpc')

    handleMeta()
    // not unsubscribe in kafkajs
    // await consumer.stop()
    // existQueue.clear()
    // subscribeQueues()
  })
}
