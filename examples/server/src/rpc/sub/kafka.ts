/* eslint-disable no-console */
import { Kafka } from 'kafkajs'
import { bind } from 'phecda-server/kafka'
import { Factory } from 'phecda-server'
import { TestRpc } from '../test.rpc'
async function start() {
  const data = await Factory([TestRpc], {
    rpc: 'src/rpc/mq.ts',
  })

  const kafka = new Kafka({
    clientId: 'consumer',
    brokers: ['kafka1:9092', 'kafka2:9092'],
  })

  const producer = kafka.producer()
  const consumer = kafka.consumer({ groupId: 'test-group' })

  bind(consumer, producer, data)

  console.log('kafka listen...')
}

start()
