import * as amqp from 'amqplib'
import { createMqPub } from 'phecda-rabbitmq'
import { useC } from 'phecda-client'
import { TestController } from './test.controller?client'
const { mq } = useC(TestController)
export async function publish() {
  const connect = await amqp.connect('amqp://localhost:5672')
  const channel = await connect.createChannel()
  const publish = createMqPub(channel)
  await publish(mq('hello world'))
}
