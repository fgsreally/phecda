import type { Consumer, Producer } from 'kafkajs'
import Debug from 'debug'
import type { Factory } from '../../core'
import { Context } from '../../context'
import type { RpcContext, RpcServerOptions } from '../types'
import { createControllerMetaMap, detectAopDep } from '../../helper'

const debug = Debug('phecda-server/kafka')

export interface KafkaCtx extends RpcContext {
  type: 'kafka'
  topic: string
  partition: number
  heartbeat(): Promise<void>
  pause(): () => void

}
// @experiment

export async function bind({ consumer, producer }: { consumer: Consumer; producer: Producer }, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts: RpcServerOptions = {}) {
  const { globalGuards, globalInterceptors, globalFilter, globalPipe } = opts

  const existQueue = new Set<string>()
  const metaMap = createControllerMetaMap(meta, (meta) => {
    const { controller, rpc, func, tag } = meta.data
    if (controller === 'rpc' && rpc?.queue !== undefined) {
      debug(`register method "${func}" in module "${tag}"`)
      return true
    }
  })

  detectAopDep(meta, {
    guards: globalGuards,
    interceptors: globalInterceptors,
  }, 'rpc')

  async function subscribeQueues() {
    existQueue.clear()
    for (const [tag, record] of metaMap) {
      for (const func in record) {
        const meta = metaMap.get(tag)![func]

        const {
          data: {
            rpc,
          },
        } = meta
        if (rpc) {
          const queue = rpc.queue || tag
          if (existQueue.has(queue))
            continue
          existQueue.add(queue)
          await consumer.subscribe({ topic: queue, fromBeginning: true })
        }
      }
    }
  }

  await subscribeQueues()
  await consumer.run({
    eachMessage: async ({ message, partition, topic, heartbeat, pause }) => {
      if (!existQueue.has(topic))
        return

      const data = JSON.parse(message.value!.toString())

      const { tag, func, id, queue: clientQueue, _ps, args } = data

      if (_ps !== 1)
        return
      debug(`invoke method "${func}" in module "${tag}"`)
      const meta = metaMap.get(tag)![func]

      const {
        data: {
          rpc,
        },
      } = meta
      const isEvent = rpc!.isEvent

      const context = new Context<KafkaCtx>({
        type: 'kafka',
        moduleMap,
        meta,
        args,
        id,
        tag,
        func,
        partition,
        topic,
        heartbeat,
        pause,

        isEvent,
        queue: topic,
      })

      await context.run({ globalGuards, globalInterceptors, globalFilter, globalPipe }, (returnData) => {
        if (!isEvent) {
          producer.send({
            topic: clientQueue,
            messages: [
              { value: JSON.stringify({ data: returnData, id }) },
            ],
          })
        }
      }, (err) => {
        if (!isEvent) {
          producer.send({
            topic: clientQueue,
            messages: [
              {
                value: JSON.stringify({
                  data: err,
                  error: true,
                  id,
                }),
              },
            ],
          })
        }
      })
    },
  })
}
