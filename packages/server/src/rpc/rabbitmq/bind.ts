import type amqplib from 'amqplib'
import type { Factory } from '../../core'
import { Context, isAopDepInject } from '../../context'
import { IS_DEV } from '../../common'
import type { P } from '../../types'
import { HMR } from '../../hmr'

export interface Options {
  globalGuards?: string[]
  globalInterceptors?: string[]
}
export interface RabbitmqCtx extends P.BaseContext {
  type: 'rabbitmq'
  ch: amqplib.Channel
  msg: amqplib.ConsumeMessage
  data: any
}

export async function bind(ch: amqplib.Channel, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts?: Options) {
  const existQueue = new Set<string>()
  const { globalGuards = [], globalInterceptors = [] } = opts || {}

  function detect() {
    IS_DEV && isAopDepInject(meta, {
      guards: globalGuards,
      interceptors: globalInterceptors,
    })
  }

  detect()

  async function createQueues() {
    for (const item of meta) {
      const {
        data: { rpc, tag, guards, interceptors, params, name, filter, ctx },
        paramsType,
      } = item

      if (rpc?.type && (rpc.type.includes('rabbitmq') || rpc.type.includes('*'))) {
        const queue = `PS:${tag as string}`
        const returnQueue = `PS:${tag as string}/return`
        const isEvent = rpc.isEvent
        if (existQueue.has(queue))
          continue

        existQueue.add(queue)
        await ch.assertQueue(queue)

        ch.consume(queue, async (msg) => {
          if (msg) {
            const data = JSON.parse(msg.content.toString())
            const { method, args, id } = data
            const context = new Context<RabbitmqCtx>({
              type: 'rabbitmq',
              moduleMap,
              meta: item,
              tag: tag as string,
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
        }, { noAck: true })
      }
    }
  }
  createQueues()

  HMR(async () => {
    detect()
    for (const queue of existQueue)
      await ch.deleteQueue(queue)
    existQueue.clear()
    await createQueues()
  })
}
