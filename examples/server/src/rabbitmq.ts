import { Factory, bindMQ } from 'phecda-server'
import amqp from 'amqplib'
import express from 'express'

import { TestController } from './test.controller'

async function start() {
  const data = await Factory([TestController])

  const connect = await amqp.connect('amqp://localhost:5672')
  const channel = await connect.createChannel()
  bindMQ(channel, data)
}
start()

export const viteNodeApp = express()
