import type amqplib from 'amqplib'
import type { ConsumeMessage } from 'amqplib'
import Debug from 'debug'
import type { Factory } from '../../core'
import { Context } from '../../context'
import type { RpcCtx, RpcServerOptions } from '../types'
import { HMR } from '../../hmr'
import { createControllerMetaMap, detectAopDep } from '../../helper'

const debug = Debug('phecda-server/rabbitmq')

export interface RabbitmqCtx extends RpcCtx {
  type: 'rabbitmq'
  ch: amqplib.Channel
  msg: amqplib.ConsumeMessage
}

export async function bind(ch: amqplib.Channel, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts: RpcServerOptions = {}) {
  const { globalGuards, globalFilter, globalPipe, globalAddons = [], defaultQueue } = opts

  const metaMap = createControllerMetaMap(meta, (meta) => {
    const { controller, rpc, method, tag } = meta.data
    if (controller === 'rpc' && rpc?.queue !== undefined) {
      debug(`register method "${method}" in module "${tag}"`)
      return true
    }
  })

  detectAopDep(meta, {
    guards: globalGuards,
    addons: globalAddons,
  }, 'rpc')
  const existQueue = new Set<string>()

  Context.applyAddons(globalAddons, ch, 'rabbitmq')
  async function subscribeQueues() {
    existQueue.clear()
    for (const [tag, record] of metaMap) {
      for (const method in record) {
        const meta = metaMap.get(tag)![method]
        const {
          data: {
            rpc,
          },
        } = meta
        if (rpc) {
          const queue = rpc.queue || defaultQueue || tag
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
      const { tag, method, id, queue: clientQueue, _ps, args } = data

      if (_ps !== 1)
        return
      debug(`invoke method "${method}" in module "${tag}"`)
      const meta = metaMap.get(tag)![method]

      const {
        data: { rpc: { isEvent } = {} },
      } = meta
      const aop = Context.getAop(meta, {
        globalFilter,
        globalGuards,
        globalPipe,
      })
      const context = new Context<RabbitmqCtx>({
        type: 'rabbitmq',
        category: 'rpc',
        moduleMap,
        meta,
        tag,
        method,
        args,
        id,
        ch,
        msg,
        isEvent,
        queue: msg.fields.routingKey,
      })
      await context.run(aop, (returnData) => {
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
