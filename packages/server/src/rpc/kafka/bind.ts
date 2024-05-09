import type { Consumer, Producer } from 'kafkajs'
import Debug from 'debug'
import type { Factory } from '../../core'
import type { Meta } from '../../meta'
import { Context, detectAopDep } from '../../context'
import type { P } from '../../types'
import { HMR } from '../../hmr'
import type { RpcServerOptions } from '../helper'

const debug = Debug('phecda-server/kafka')

export interface KafkaCtx extends P.BaseContext {
  type: 'kafka'
  topic: string
  partition: number
  heartbeat(): Promise<void>
  pause(): () => void
  data: any
}
// @experiment

export async function bind(consumer: Consumer, producer: Producer, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts?: RpcServerOptions) {
  const { globalGuards = [], globalInterceptors = [] } = opts || {}

  const metaMap = new Map<string, Record<string, Meta>>()
  const existQueue = new Set<string>()
  function handleMeta() {
    metaMap.clear()
    for (const item of meta) {
      const { tag, func, rpc } = item.data
      if (!rpc)
        continue

      if (metaMap.has(tag))
        metaMap.get(tag)![func] = item

      else
        metaMap.set(tag, { [func]: item })
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
      })

      try {
        await context.useGuard([...globalGuards, ...guards])
        const cache = await context.useInterceptor([...globalInterceptors, ...interceptors])
        if (cache !== undefined) {
          if (!isEvent) {
            producer.send({
              topic: clientQueue,
              messages: [
                { value: JSON.stringify({ data: cache, id }) },
              ],
            })
          }

          return
        }
        const handleArgs = await context.usePipe(params.map(({ type, key, pipe, pipeOpts, index }, i) => {
          return { arg: args[i], pipe, pipeOpts, key, type, index, reflect: paramsType[index] }
        }))

        const instance = moduleMap.get(name)
        if (ctx)
          instance[ctx] = context.data
        const funcData = await instance[func](...handleArgs)

        const ret = await context.usePostInterceptor(funcData)

        if (!isEvent) {
          producer.send({
            topic: clientQueue,
            messages: [
              { value: JSON.stringify({ data: ret, id }) },
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
