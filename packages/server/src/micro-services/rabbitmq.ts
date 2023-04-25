import type amqplib from 'amqplib'

import type { Pmeta } from '../meta'
import { Pcontext, RabbitMqContext, parseMeta } from '../context'
import { resolveDep } from '../utils'
import { Pconfig } from '../config'

export async function bindMQ(ch: amqplib.Channel, { meta, moduleMap }: { meta: Pmeta[]; moduleMap: any }) {
  for (const item of meta) {
    const { route, name, method, mq: { routeKey, queue: queueName, options } = {} } = item.data
    const tag = `${name}-${method}`
    Pcontext.metaRecord[tag] = item

    const {
      guards,
      reflect,
      interceptors,
      params,
    } = Pcontext.metaDataRecord[tag] ? Pcontext.metaDataRecord[tag] : (Pcontext.metaDataRecord[tag] = parseMeta(item))
    const instance = moduleMap.get(name)!
    const handler = instance[method].bind(instance)

    Pcontext.instanceRecord[name] = instance

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
          const context = new RabbitMqContext(tag, contextMeta)

          try {
            if (Pconfig.rabbitmq.guard)
              await context.useGuard(guards)
            if (Pconfig.rabbitmq.interceptor)
              await context.useInterceptor(interceptors)

            const args = await context.usePipe(params.map(({ key, validate }) => {
              return { arg: resolveDep(data, key), validate }
            }), reflect)

            instance.meta = contextMeta

            await context.usePost(await handler(...args))
            ch.ack(msg)
          }
          catch (e) {
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
