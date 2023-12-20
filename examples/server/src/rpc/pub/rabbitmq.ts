import { createClient } from 'phecda-server/rabbitmq'
import amqp from 'amqplib'
import type { TestRpc } from '../test.controller'
import { TestRpc as Faker } from '../mq'
export async function start() {
  const conn = await amqp.connect('amqp://localhost:5672')

  const ch = await conn.createChannel()
  const client = await createClient(ch, 'test', {
    test: Faker as unknown as typeof TestRpc,
  })
  const ret = await client.test.run('xx')
  console.log(`return with ${ret}`)

  const nullRet = client.test.event('event')

  console.log(`return with ${nullRet}`)
}

start()
