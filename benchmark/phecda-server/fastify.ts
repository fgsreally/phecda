/* eslint-disable no-console */
/* eslint-disable import/first */

console.time('cold-start')

import { bindApp } from 'phecda-server/fastify'

import { Factory } from 'phecda-server'
import Fastify from 'fastify'
import { AppController } from './app.controller'

async function start() {
  const data = await Factory([AppController])
  const fastify = Fastify({
    logger: true,
  })

  fastify.register(bindApp(data))
  fastify.listen({ port: process.env.PORT as any }, () => {
    console.timeEnd('cold-start')
    console.log(`phecda-server/fastify started on port ${process.env.PORT}`)
  })
}

start()
