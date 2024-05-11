import type amqplib from 'amqplib'
import type { ConsumeMessage } from 'amqplib'
import Debug from 'debug'
import type { Factory } from '../../core'
import { Context, detectAopDep } from '../../context'
import type { RpcContext } from '../../types'
import { HMR } from '../../hmr'
import type { RpcServerOptions } from '../helper'
import type { Meta } from '../../meta'

const debug = Debug('phecda-server/rabbitmq')

export interface RabbitmqCtx extends RpcContext {
  type: 'rabbitmq'
  ch: amqplib.Channel
  msg: amqplib.ConsumeMessage
}

export async function bind(ch: amqplib.Channel, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts?: RpcServerOptions) {
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
        await ch.assertQueue(queue)

        ch.consume(queue, handleRequest, { noAck: true })
      }
    }
  }

  async function handleRequest(msg: ConsumeMessage | null) {
    function send(queue: string, data: any, isEvent?: boolean) {
      if (isEvent)
        return
      ch.sendToQueue(queue, Buffer.from(JSON.stringify(data)))
    }

    if (msg) {
      const data = JSON.parse(msg.content.toString())
      const { tag, func, args, id, queue: clientQueue } = data

      debug(`invoke method "${func}" in module "${tag}"`)
      const meta = metaMap.get(tag)![func]

      const {
        data: { rpc: { isEvent } = {}, guards, interceptors, params, name, filter, ctx },
        paramsType,
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

      try {
        await context.useGuard([...globalGuards, ...guards])
        const i1 = await context.useInterceptor([...globalInterceptors, ...interceptors])
        if (i1 !== undefined)

          return i1

        const handleArgs = await context.usePipe(params.map(({ type, key, pipe, pipeOpts, index }, i) => {
          return { arg: args[i], pipe, pipeOpts, key, type, index, reflect: paramsType[index] }
        }))

        const instance = moduleMap.get(name)
        if (ctx)
          instance[ctx] = context.data
        const funcData = await instance[func](...handleArgs)

        const i2 = await context.usePostInterceptor(funcData)
        if (i2 !== undefined)

          return i2

        send(clientQueue, { data: funcData, id }, isEvent)
      }
      catch (e) {
        const ret = await context.useFilter(e, filter)
        send(clientQueue, { data: ret, id, error: true }, isEvent)
      }
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
