/* eslint-disable no-console */
import { createClient } from 'phecda-server/kafka'
import { Kafka } from 'kafkajs'
import { TestRpc } from '../test.rpc'
export async function start() {
  const kafka = new Kafka({
    clientId: 'pub',
    brokers: ['localhost:9092'],
  })

  const producer = kafka.producer()
  const consumer = kafka.consumer({ groupId: 'my-group' })

  await producer.connect()
  await consumer.connect()

  const client = await createClient(producer, consumer, {
    test: TestRpc,
  })
  const ret = await client.test.run('xx')
  console.log(`return with ${ret}`)

  const nullRet = await client.test.event('event')

  console.log(`return with ${nullRet}`)
}

start()
