/* eslint-disable no-console */
import { createClient } from 'phecda-server/rabbitmq'
import amqp from 'amqplib'
import { TestRpc } from '../test.rpc'

export async function start() {
  const conn = await amqp.connect('amqp://localhost:5672')

  const ch = await conn.createChannel()
  const client = await createClient(ch, {
    test: TestRpc,
  })
  const ret = await client.test.run('xx')
  console.log(`return with ${ret}`)

  const nullRet = await client.test.event('event')

  console.log(`return with ${nullRet}`)
}

start()
