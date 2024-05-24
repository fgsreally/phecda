/* eslint-disable no-console */
import amqp from 'amqplib'
import { bind } from 'phecda-server/rabbitmq'
import { Factory, RPCGenerator } from 'phecda-server'
import { TestRpc } from '../test.rpc'
async function start() {
  const data = await Factory([TestRpc], {
    generators: [new RPCGenerator('./rpc.ts')],
  })

  const conn = await amqp.connect('amqp://localhost:5672')

  const ch = await conn.createChannel()

  bind(ch, data)

  console.log('mq listen...')
}

start()
