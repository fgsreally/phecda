import type amqplib from 'amqplib'
import type { ConsumeMessage } from 'amqplib'
import Debug from 'debug'
import type { Factory } from '../../core'
import { Context, detectAopDep } from '../../context'
import type { RpcContext } from '../../types'
import { HMR } from '../../hmr'
import type { RpcServerOptions } from '../helper'
import type { ControllerMeta } from '../../meta'

const debug = Debug('phecda-server/rabbitmq')

export interface RabbitmqCtx extends RpcContext {
  type: 'rabbitmq'
  ch: amqplib.Channel
  msg: amqplib.ConsumeMessage
}

export async function bind(ch: amqplib.Channel, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts?: RpcServerOptions) {
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
          await ch.assertQueue(queue)

          ch.consume(queue, handleRequest, { noAck: true })
        }
      }
    }
  }

  async function handleRequest(msg: ConsumeMessage | null) {
    function send(queue: string, data: any) {
      ch.sendToQueue(queue, Buffer.from(JSON.stringify(data)))
    }

    if (msg) {
      const data = JSON.parse(msg.content.toString())
      const { tag, func, id, queue: clientQueue, _ps } = data

      if (_ps !== 1)
        return
      debug(`invoke method "${func}" in module "${tag}"`)
      const meta = metaMap.get(tag)![func]

      const {
        data: { rpc: { isEvent } = {} },
      } = meta

      const context = new Context<RabbitmqCtx>({
        type: 'rabbitmq',
        moduleMap,
        meta,
        tag,
        func,
        data,
        ch,
        msg,
        send(data) {
          if (!isEvent)
            ch.sendToQueue(clientQueue, Buffer.from(JSON.stringify({ data, id })))
        },
      })
      await context.run((returnData) => {
        if (!isEvent)
          send(clientQueue, { data: returnData, id })
      }, (err) => {
        if (!isEvent)

          send(clientQueue, { data: err, id, error: true })
      })
    }
  }

  detectAopDep(meta, {
    guards: globalGuards,
    interceptors: globalInterceptors,
  }, 'rpc')

  handleMeta()
  subscribeQueues()

  HMR(async () => {
    detectAopDep(meta, {
      guards: globalGuards,
      interceptors: globalInterceptors,
    }, 'rpc')
    handleMeta()
    for (const queue of existQueue)
      await ch.deleteQueue(queue)

    await subscribeQueues()
  })
}
