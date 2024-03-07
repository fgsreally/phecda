import type { Kafka } from 'kafkajs'
import type { Factory } from '../../core'
import type { Meta } from '../../meta'
import { BadRequestException } from '../../exception'
import { Context, isAopDepInject } from '../../context'
import { IS_DEV } from '../../common'
import type { P } from '../../types'

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

export async function bind(kafka: Kafka, topic: string, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts?: Options) {
  const metaMap = new Map<string, Meta>()

  const { globalGuards = [], globalInterceptors = [] } = opts || {}

  const producer = kafka.producer()
  await producer.connect()

  const consumer = kafka.consumer({ groupId: 'phecda-server' })
  await consumer.connect()

  await consumer.subscribe({ topic, fromBeginning: true })

  function handleMeta() {
    IS_DEV && isAopDepInject(meta, {
      guards: globalGuards,
      interceptors: globalInterceptors,
    })

    for (const item of meta) {
      const { data: { rpc, method, name } } = item

      if (rpc?.type && rpc.type.includes('kafka'))
        metaMap.set(`${name}-${method}`, item)
    }
  }

  handleMeta()
  await consumer.run({
    eachMessage: async ({ message, partition, topic, heartbeat, pause }) => {
      const data = JSON.parse(message.value!.toString())
      const { tag, args, queue, id } = data

      if (!metaMap.has(tag)) {
        if (queue) {
          producer.send({
            topic: queue,
            messages: [
              {
                value: JSON.stringify({
                  data: new BadRequestException(`service "${tag}" doesn't exist`).data,
                  error: true,
                  id,
                }),
              },
            ],
          })
        }

        return
      }

      const meta = metaMap.get(tag)!
      const context = new Context<KafkaCtx>({
        type: 'kafka',
        moduleMap,
        meta,
        tag,
        partition,
        topic,
        heartbeat,
        pause,
        data,
      })
      const {
        data: {
          guards, interceptors, params, name, method, filter,
        },
        paramsType,
      } = meta
      try {
        await context.useGuard([...globalGuards, ...guards])
        const cache = await context.useInterceptor([...globalInterceptors, ...interceptors])
        if (cache !== undefined) {
          if (queue) {
            producer.send({
              topic: queue,
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

        const funcData = await moduleMap.get(name)[method](...handleArgs)
        const ret = await context.usePostInterceptor(funcData)

        if (queue) {
          producer.send({
            topic: queue,
            messages: [
              { value: JSON.stringify({ data: ret, id }) },
            ],
          })
        }
      }
      catch (e) {
        const ret = await context.useFilter(e, filter)
        if (queue) {
          producer.send({
            topic: queue,
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

  if (IS_DEV) {
    globalThis.__PS_HMR__?.push(async () => {
      handleMeta()
    })
  }
}
