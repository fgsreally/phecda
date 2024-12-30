import type { Consumer, Producer } from 'kafkajs'
import { RpcAdapter } from './client'

// @experiment

export function KafkaAdaptor({ producer, consumer }: { producer: Producer; consumer: Consumer }): RpcAdapter {
  return async ({ clientQueue, receive }) => {
    await consumer.subscribe({ topic: clientQueue, fromBeginning: true })
    await consumer.run(
      {
        eachMessage: async ({ message, topic }) => {
          if (clientQueue === topic && message.value)
            receive(JSON.parse(message.value.toString()))
        },
      },
    )

    return {
      send: ({ data, queue }) => {
        producer.send({
          topic: queue,
          messages: [
            {
              value: JSON.stringify(data),
            },
          ],
        })
      },
    }
  }
}
