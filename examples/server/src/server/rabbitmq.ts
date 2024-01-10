/* eslint-disable no-console */
import { Factory } from 'phecda-server'
import { bindMQ } from 'phecda-rabbitmq'
import amqp from 'amqplib'
import express from 'express'

import { TestController } from './test.controller'

async function start() {
  const data = await Factory([TestController])

  const connect = await amqp.connect('amqp://127.0.0.1:5672')
  const channel = await connect.createChannel()
  bindMQ(channel, data)
  console.log('start mq...')
}
start()

export const viteNodeApp = express()
