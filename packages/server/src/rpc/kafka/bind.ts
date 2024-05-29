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
      const { tag, func, controller, rpc } = item.data
      if (controller !== 'rpc' || rpc?.queue === undefined)
        continue

      if (metaMap.has(tag))
        metaMap.get(tag)![func] = item as ControllerMeta

      else
        metaMap.set(tag, { [func]: item as ControllerMeta })
    }
  }

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

      const { tag, func, id, queue: clientQueue, _ps } = data

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

      await context.run((returnData) => {
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
