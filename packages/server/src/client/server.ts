import type amqplib from 'amqplib'
export * from './axios'

export function createMqReq(channel: amqplib.Channel): <R>(arg: R) => Promise<void> {
  return async (arg: any) => {
    const { url, body } = arg
    await channel.assertQueue(url)
    await channel.sendToQueue(url, Buffer.from(JSON.stringify(body)))
  }
}
