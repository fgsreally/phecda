import type { Consumer, Producer } from 'kafkajs'
import type { Factory } from '../../core'
import type { Meta } from '../../meta'
import { Context, isAopDepInject } from '../../context'
import { IS_DEV } from '../../common'
import type { P } from '../../types'
import { HMR } from '../../hmr'

export interface Options {
  globalGuards?: string[]
  globalInterceptors?: string[]
}
export interface KafkaCtx extends P.BaseContext {
  type: 'kafka'
  topic: string
  partition: number
  heartbeat(): Promise<void>
  pause(): () => void
  data: any
}

export async function bind(consumer: Consumer, producer: Producer, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts?: Options) {
  const { globalGuards = [], globalInterceptors = [] } = opts || {}

  const existQueueMetaMap = new Map<string, Meta>()

  await producer.connect()
  await consumer.connect()

  function detect() {
    IS_DEV && isAopDepInject(meta, {
      guards: globalGuards,
      interceptors: globalInterceptors,
    })
  }

  detect()
  subscribeQueues()
  async function subscribeQueues() {
    for (const item of meta) {
      const {
        data: {
          rpc, tag,
        },
      } = item
      if (rpc?.type && (rpc.type.includes('kafka') || rpc.type.includes('*'))) {
        const queue = `PS:${tag as string}`

        if (existQueueMetaMap.has(queue))
          continue

        existQueueMetaMap.set(queue, item)
        await consumer.subscribe({ topic: queue, fromBeginning: true })
      }
    }
  }

  await consumer.run({
    eachMessage: async ({ message, partition, topic, heartbeat, pause }) => {
      if (!existQueueMetaMap.has(topic))
        return

      const meta = existQueueMetaMap.get(topic)!
      const returnQueue = `${topic}/return`
      const {
        data: {
          guards, interceptors, params, name, filter, ctx, tag, rpc,
        },
        paramsType,
      } = meta
      const isEvent = rpc!.isEvent

      const data = JSON.parse(message.value!.toString())
      const { method, args, id } = data

      const context = new Context<KafkaCtx>({
        type: 'kafka',
        moduleMap,
        meta,
        tag: tag as string,
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

  HMR(async () => {
    detect()
    existQueueMetaMap.clear()
    subscribeQueues()
  })
}
