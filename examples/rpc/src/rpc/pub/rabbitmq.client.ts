/* eslint-disable no-console */
import { RabbitmqAdaptor, createClient } from 'phecda-client/rpc'
import amqp from 'amqplib'
import { TestRpc } from '../test.rpc'

export async function start() {
  const conn = await amqp.connect('amqp://localhost:5672')

  const ch = await conn.createChannel()
  const client = createClient({
    test: TestRpc,
  }, RabbitmqAdaptor(ch))
  const ret = await client.test.run('xx')
  console.log(`return with ${ret}`)

  const nullRet = await client.test.event('event')

  console.log(`return with ${nullRet}`)
}

start()
