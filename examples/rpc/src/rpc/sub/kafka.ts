/* eslint-disable no-console */
import { Kafka } from 'kafkajs'
import { bind } from 'phecda-server/kafka'
import { Factory, RPCGenerator } from 'phecda-server'
import { TestRpc } from '../test.rpc'
async function start() {
  const data = await Factory([TestRpc], {
    generators: [new RPCGenerator()],
  })

  const kafka = new Kafka({
    clientId: 'consumer',
    brokers: ['localhost:9092'],
  })

  const producer = kafka.producer()
  const consumer = kafka.consumer({ groupId: 'phecda-server' })

  await producer.connect()
  await consumer.connect()

  await bind({ consumer, producer }, data)

  console.log('kafka listen...')
}

start()
