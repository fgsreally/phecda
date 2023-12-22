import { bindApp } from 'phecda-server/fastify'

import { Factory } from 'phecda-server'
import Fastify from 'fastify'
import { TestController } from './test.controller'

const data = await Factory([TestController], {
  http: 'pmeta.js',
})
const fastify = Fastify({
  logger: true,
})

fastify.register(bindApp(data), {
  prefix: '/base',
})
fastify.listen({ port: 3005 }, (err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }

  // eslint-disable-next-line no-console
  console.log('start listening..')
})
