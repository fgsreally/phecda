import type amqplib from 'amqplib'

import { RpcAdapter } from './client'

export function RabbitmqAdaptor(ch: amqplib.Channel): RpcAdapter {
  return async ({ clientQueue, receive }) => {
    await ch.assertQueue(clientQueue)
    ch.consume(clientQueue, (msg) => {
      if (!msg)
        return
      receive(JSON.parse(msg.content.toString()))
    })

    return {
      send: ({ data, queue }) => {
        ch.sendToQueue(queue, Buffer.from(
          JSON.stringify(
            data,
          ),
        ))
      },
    }
  }
}
