import type amqplib from 'amqplib'
import type { ConsumeMessage } from 'amqplib'
import type { Factory } from '../../core'
import { Context, detectAopDep } from '../../context'
import type { P } from '../../types'
import { HMR } from '../../hmr'
import type { RpcOptions } from '../helper'
import { generateReturnQueue } from '../helper'
import type { Meta } from '../../meta'

export interface RabbitmqCtx extends P.BaseContext {
  type: 'rabbitmq'
  ch: amqplib.Channel
  msg: amqplib.ConsumeMessage
  data: any
}

export async function bind(ch: amqplib.Channel, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts?: RpcOptions) {
  const { globalGuards = [], globalInterceptors = [] } = opts || {}

  const metaMap = new Map<string, Record<string, Meta>>()
  const existQueue = new Set<string>()
  function handleMeta() {
    metaMap.clear()
    for (const item of meta) {
      const { tag, method, rpc, guards, interceptors } = item.data
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
        await ch.assertQueue(queue)

        ch.consume(queue, handleRequest(queue), { noAck: true })
      }
    }
  }

  function handleRequest(queue: string) {
    const returnQueue = generateReturnQueue(queue)
    return async (msg: ConsumeMessage | null) => {
      if (msg) {
        const data = JSON.parse(msg.content.toString())
        const { tag, method, args, id } = data

        const meta = metaMap.get(tag)![method]

        const {
          data: { rpc: { isEvent } = {}, guards, interceptors, params, name, filter, ctx },
          paramsType,
        } = meta

        const context = new Context<RabbitmqCtx>({
          type: 'rabbitmq',
          moduleMap,
          meta,
          tag,
          method,
          data,
          ch,
          msg,
        })

        try {
          await context.useGuard([...globalGuards, ...guards])
          const cache = await context.useInterceptor([...globalInterceptors, ...interceptors])
          if (cache !== undefined) {
            if (!isEvent)
              ch.sendToQueue(returnQueue, Buffer.from(JSON.stringify({ data: cache, id })))

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
          if (!isEvent)
            ch.sendToQueue(returnQueue, Buffer.from(JSON.stringify({ data: ret, id })))
        }
        catch (e) {
          const ret = await context.useFilter(e, filter)
          if (!isEvent) {
            ch.sendToQueue(returnQueue, Buffer.from(JSON.stringify({
              data: ret,
              error: true,
              id,
            })))
          }
        }
      }
    }
  }
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
    for (const queue of existQueue)
      await ch.deleteQueue(queue)
    existQueue.clear()
    await subscribeQueues()
  })
}
