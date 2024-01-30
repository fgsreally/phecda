/* eslint-disable no-console */
import amqp from 'amqplib'
import { bind } from 'phecda-server/rabbitmq'
import { Factory } from 'phecda-server'
import { TestRpc } from '../test.rpc'
async function start() {
  const data = await Factory([TestRpc], {
    rpc: 'src/rpc/mq.ts',
  })

  const conn = await amqp.connect('amqp://localhost:5672')

  const ch = await conn.createChannel()

  bind(ch, 'test', data)

  console.log('mq listen...')
}

start()
