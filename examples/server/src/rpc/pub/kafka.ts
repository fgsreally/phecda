/* eslint-disable no-console */
import { createClient } from 'phecda-server/kafka'
import { Kafka } from 'kafkajs'
// import { TestRpc } from '../test.rpc'
import { TestRpc as Faker } from '../mq'
export async function start() {
  const kafka = new Kafka({
    clientId: 'consumer',
    brokers: ['kafka1:9092', 'kafka2:9092'],
  })

  const producer = kafka.producer()
  const consumer = kafka.consumer({ groupId: 'test-group' })

  const client = await createClient(producer, consumer, {
    test: Faker,
  })
  const ret = await client.test.run('xx')
  console.log(`return with ${ret}`)

  const nullRet = await client.test.event('event')

  console.log(`return with ${nullRet}`)
}

start()
