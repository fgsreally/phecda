import type amqplib from 'amqplib'

import { Context, parseMeta, resolveDep } from 'phecda-server'
import type { Factory } from 'phecda-server'
import { RabbitMqContext } from './context'
export async function bindMQ(ch: amqplib.Channel, { meta, moduleMap }: Awaited<ReturnType<typeof Factory>>, opts: {
  guard?: boolean
  interceptor?: boolean
} = {}) {
  for (const item of meta) {
    const { route, tag, method, name, define: { rabbitmq = {} } } = item.data
    const { routeKey, queue: queueName, options } = rabbitmq
    const methodTag = `${name}-${method}`
    Context.metaRecord[methodTag] = item

    const {
      guards,
      reflect,
      interceptors,
      params,
    } = Context.metaDataRecord[methodTag] ? Context.metaDataRecord[methodTag] : (Context.metaDataRecord[methodTag] = parseMeta(item))
    const instance = moduleMap.get(tag)!
    const handler = instance[method].bind(instance)

    Context.instanceRecord[name] = instance

    if (route) {
      const { queue } = await ch.assertQueue(route.route)
      if (queueName && routeKey)
        await ch.bindQueue(queue, queueName, routeKey)

      ch.consume(route.route, async (msg) => {
        if (msg !== null) {
          const content = msg.content.toString()

          const data = params.length > 0 ? JSON.parse(content) : content
          const contextMeta = {
            message: msg,
            content,
            channel: ch,

          }
          const context = new RabbitMqContext(methodTag, contextMeta)

          try {
            if (opts.guard)
              await context.useGuard(guards)
            if (opts.interceptor)
              await context.useInterceptor(interceptors)

            const args = await context.usePipe(params.map(({ key, validate }) => {
              return { arg: resolveDep(data, key), validate }
            }), reflect)

            instance.meta = contextMeta

            await context.usePost(await handler(...args))
            ch.ack(msg)
          }
          catch (e) {
            item.handlers.forEach(handler => handler.error?.(e))
            context.useFilter(e)
          }
        }
        else {
          // console.log('Consumer cancelled by server')
        }
      }, options)
    }
  }
}

type MqMethod<T> = (arg: T) => void

/**
 * @experiment
 */
export async function createPub<T extends (...args: any[]) => any>(ch: amqplib.Channel, method: T, type?: string): Promise<MqMethod<Parameters<T>>> {
  const { exchange, routeKey, queue } = method()
  if (exchange)
    await ch.assertExchange(exchange, type!)

  else
    await ch.assertQueue(queue)

  return async (arg: Parameters<T>) => {
    const { args } = method(arg)
    const msg = Buffer.from(JSON.stringify(args))
    if (exchange)
      await ch.publish(exchange, routeKey, msg)

    else
      await ch.sendToQueue(queue, msg)
  }
}
