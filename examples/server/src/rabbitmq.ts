import { Factory } from 'phecda-server'
import { bindMQ } from 'phecda-rabbitmq'
import amqp from 'amqplib'
import express from 'express'

import { TestController } from './test.controller'

async function start() {
  console.log('start mq...')
  const data = await Factory([TestController])

  const connect = await amqp.connect('amqp://127.0.0.1:5672')
  const channel = await connect.createChannel()
  bindMQ(channel, data)
}
start()

export const viteNodeApp = express()
