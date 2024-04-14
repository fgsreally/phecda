import type { Consumer, Producer } from 'kafkajs'
import type { Factory } from '../../core'
import type { Meta } from '../../meta'
import { Context, detectAopDep } from '../../context'
import type { P } from '../../types'
import { HMR } from '../../hmr'
import type { RpcOptions } from '../helper'
import { generateReturnQueue } from '../helper'

export interface KafkaCtx extends P.BaseContext {
  type: 'kafka'
  topic: string
  partition: number
  heartbeat(): Promise<void>
  pause(): () => void
  data: any
}

export async function bind(consumer: Consumer, producer: Producer, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts?: RpcOptions) {
  const { globalGuards = [], globalInterceptors = [] } = opts || {}

  await producer.connect()
  await consumer.connect()

  const metaMap = new Map<string, Record<string, Meta>>()
  const existQueue = new Set<string>()
  function handleMeta() {
    metaMap.clear()
    for (const item of meta) {
      const { tag, method, rpc, interceptors, guards } = item.data
      if (!rpc)
        continue
      detectAopDep(meta, {
        guards,
        interceptors,
      })
      if (metaMap.has(tag))
        metaMap.get(tag)![method] = item

      else
        metaMap.set(tag, { [method]: item })
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
        existQueue.add(queue)
        await consumer.subscribe({ topic: queue, fromBeginning: true })
      }
    }
  }

  await consumer.run({
    eachMessage: async ({ message, partition, topic, heartbeat, pause }) => {
      if (!existQueue.has(topic))
        return

      const data = JSON.parse(message.value!.toString())
      const { tag, method, args, id } = data
      const meta = metaMap.get(tag)![method]
      const returnQueue = generateReturnQueue(topic)
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
        method,
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
              topic: returnQueue,
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
        const funcData = await instance[method](...handleArgs)

        const ret = await context.usePostInterceptor(funcData)

        if (!isEvent) {
          producer.send({
            topic: returnQueue,
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
            topic: returnQueue,
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

  detectAopDep(meta, {
    guards: globalGuards,
    interceptors: globalInterceptors,
  })
  handleMeta()
  subscribeQueues()

  HMR(async () => {
    detectAopDep(meta, {
      guards: globalGuards,
      interceptors: globalInterceptors,
    })
    handleMeta()
    subscribeQueues()
  })
}
