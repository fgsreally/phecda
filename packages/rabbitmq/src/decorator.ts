import { Define } from 'phecda-server'
import type amqplib from 'amqplib'
export function MQ(queue: string, routeKey: string, options?: amqplib.Options.Consume) {
  return Define('rabbitmq', {
    queue,
    routeKey,
    options,
  })
}
