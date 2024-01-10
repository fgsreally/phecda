import type amqplib from 'amqplib'
import type { Factory } from '../../core'
import type { Meta } from '../../meta'
import { BadRequestException } from '../../exception'
import { Context, isAopDepInject } from '../../context'
import { IS_DEV } from '../../common'

export interface Options {
  globalGuards?: string[]
  globalInterceptors?: string[]
}
export interface RabbitmqCtx {
  type: 'rabbitmq'
  meta?: Meta
  moduleMap: Record<string, any>
  ch: amqplib.Channel
  msg: amqplib.ConsumeMessage
  // JSON parse msg.content
  data: any
  [key: string]: any

}

export async function bind(ch: amqplib.Channel, queue: string, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts?: Options) {
  const metaMap = new Map<string, Meta>()

  const existQueue = new Set<string>()
  const { globalGuards = [], globalInterceptors = [] } = opts || {}

  isAopDepInject(meta, {
    guards: globalGuards,
    interceptors: globalInterceptors,
  })

  function handleMeta() {
    for (const item of meta) {
      const { data: { rpc, method, name } } = item

      if (rpc?.type && rpc.type.includes('mq'))
        metaMap.set(`${name}-${method}`, item)
    }
  }

  handleMeta()

  await ch.assertQueue(queue)

  ch.consume(queue, async (msg) => {
    if (msg) {
      const data = JSON.parse(msg.content.toString())
      const { tag, args, queue, id } = data
      const context = new Context(tag, {
        type: 'rabbitmq',
        moduleMap,
        meta: metaMap.get(tag),
        data,
        ch,
        msg,
      })
      if (!existQueue.has(queue))
        await ch.assertQueue(queue)

      try {
        if (!metaMap.has(tag))
          throw new BadRequestException(`service "${tag}" doesn't exist`)

        const {
          data: {
            guards, interceptors, params, name, method,
          },
          paramsType,
        } = metaMap.get(tag)!

        await context.useGuard([...globalGuards, ...guards])
        const cache = await context.useInterceptor([...globalInterceptors, ...interceptors])
        if (cache !== undefined) {
          if (queue)
            ch.sendToQueue(queue, Buffer.from(JSON.stringify({ data: cache, id })))

          return
        }
        const handleArgs = await context.usePipe(params.map(({ type, key, pipe, pipeOpts, index }, i) => {
          return { arg: args[i], pipe, pipeOpts, key, type, index, reflect: paramsType[index] }
        }))

        const funcData = await moduleMap.get(name)[method](...handleArgs)
        const ret = await context.usePostInterceptor(funcData)
        if (queue)
          ch.sendToQueue(queue, Buffer.from(JSON.stringify({ data: ret, id })))
      }
      catch (e) {
        const ret = await context.useFilter(e)
        if (queue) {
          ch.sendToQueue(queue, Buffer.from(JSON.stringify({
            data: ret,
            error: ret.error,
            id,
          })))
        }
      }
    }
  }, { noAck: true })

  if (IS_DEV) {
    globalThis.__PS_HMR__?.push(async () => {
      handleMeta()
    })
  }
}
