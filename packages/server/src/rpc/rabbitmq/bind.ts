import type amqplib from 'amqplib'
import type { ConsumeMessage } from 'amqplib'
import Debug from 'debug'
import type { Factory } from '../../core'
import { Context } from '../../context'
import type { RpcContext, RpcServerOptions } from '../helper'
import { HMR } from '../../hmr'
import { createControllerMetaMap, detectAopDep } from '../../helper'

const debug = Debug('phecda-server/rabbitmq')

export interface RabbitmqCtx extends RpcContext {
  type: 'rabbitmq'
  ch: amqplib.Channel
  msg: amqplib.ConsumeMessage
}

export async function bind(ch: amqplib.Channel, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts: RpcServerOptions = {}) {
  const { globalGuards, globalInterceptors, globalFilter, globalPipe } = opts

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
  const existQueue = new Set<string>()

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
      const { tag, func, id, queue: clientQueue, _ps, args } = data

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
        args,
        id,
        ch,
        msg,
        isEvent,
        queue: msg.fields.routingKey,
      })
      await context.run({ globalGuards, globalInterceptors, globalFilter, globalPipe }, (returnData) => {
        if (!isEvent)
          send(clientQueue, { data: returnData, id })
      }, (err) => {
        if (!isEvent)

          send(clientQueue, { data: err, id, error: true })
      })
    }
  }

  subscribeQueues()

  HMR(async () => {
    for (const queue of existQueue)
      await ch.deleteQueue(queue)

    await subscribeQueues()
  })
}
