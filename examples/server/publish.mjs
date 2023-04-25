import * as amqp from 'amqplib'

async function start() {
  const connect = await amqp.connect('amqp://localhost:5672')
  const channel = await connect.createChannel()

  await channel.assertQueue('/base/mq')
  await channel.sendToQueue('/base/mq', Buffer.from(JSON.stringify('hello world')))
  console.log('end')
}

start()
