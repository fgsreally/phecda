import type amqplib from 'amqplib'
import type { Factory, Meta } from 'phecda-server'
import { Context } from './context'

export interface Options {
  globalGuards?: string[]
  globalInterceptors?: string[]
  dev?: boolean
}

export async function bind(ch: amqplib.Channel, queue: string, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts?: Options) {
  const metaMap = new Map<string, Meta>()

  const existQueue = new Set<string>()
  const { dev = process.env.NODE_ENV !== 'production', globalGuards = [], globalInterceptors = [] } = opts || {}
  function handleMeta() {
    for (const item of meta) {
      const { data: { rpc, method, name } } = item

      if (rpc && rpc.includes('mq'))
        metaMap.set(`${name}-${method}`, item)
    }
  }

  handleMeta()

  await ch.assertQueue(queue)

  ch.consume(queue, async (msg) => {
    if (msg) {
      const { tag, args, queue, id } = JSON.parse(msg.content.toString())
      const context = new Context(tag, null)
      if (!existQueue.has(queue))
        await ch.assertQueue(queue)

      try {
        if (!metaMap.has(tag))
          throw new Error(`service "${tag}" doesn't exist`)

        const {
          data: {
            guards, interceptors, params, name, method,
          },
          reflect,
        } = metaMap.get(tag)!

        await context.useGuard([...globalGuards, ...guards])
        if (await context.useInterceptor([...globalInterceptors, ...interceptors]))
          return

        const handleArgs = await context.usePipe(params.map(({ type, key, option, index }, i) => {
          return { arg: args[i], option, key, type, index, reflect: reflect[index] }
        }), tag)

        const funcData = await moduleMap.get(name)[method](...handleArgs)
        const ret = await context.usePostInterceptor(funcData)
        if (queue)
          ch.sendToQueue(queue, Buffer.from(JSON.stringify({ data: ret, id })))
      }
      catch (e) {
        const err = await context.useFilter(e)
        if (queue)
          ch.sendToQueue(queue, Buffer.from(JSON.stringify(err)))
      }

      ch.ack(msg)
    }
  })

  if (dev) {
    // @ts-expect-error globalThis
    const rawMetaHmr = globalThis.__PS_WRITEMETA__
    // @ts-expect-error globalThis

    globalThis.__PS_WRITEMETA__ = () => {
      handleMeta()
      rawMetaHmr?.()
    }
  }
}
