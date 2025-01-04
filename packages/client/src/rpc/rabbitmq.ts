import type amqplib from 'amqplib'

import { RpcAdapter } from './client'

export function RabbitmqAdaptor(ch: amqplib.Channel): RpcAdapter {
  return ({ clientQueue, receive }) => {
    return {
      async init() {
        await ch.assertQueue(clientQueue)
        ch.consume(clientQueue, (msg) => {
          if (!msg)
            return
          receive(JSON.parse(msg.content.toString()))
        })
      },
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
