import { bind } from 'phecda-server/fastify'

import { Factory, HTTPGenerator, log } from 'phecda-server'
import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import { TestController } from './modules/test.controller'
const data = await Factory([TestController], {
  generators: [new HTTPGenerator()],
})
const fastify = Fastify({
  logger: false,
})

fastify.register(cookie, {
  secret: 'my-secret',
  hook: 'onRequest',
})

bind(fastify, data, {
  fastifyOpts: {
    prefix: '/base',
  },
  parallelRoute: '/__PHECDA_SERVER__',
})

// addFilter('test', (e, tag, ctx) => {
//   const readableStream = fs.createReadStream('./index.html')
//   ctx.response.send(readableStream)

//   return new Promise((resolve) => {
//     ctx.response.raw.on('finish', () => {
//       resolve()
//     })
//   })
// })
// addAddon('test', (fastify, _, done) => {
//   fastify.addHook('onRequest', (_request, reply, done) => {
//     reply.header('X-Custom-Header', 'default')

//     done()
//   })
//   done()
// })

fastify.listen({ port: 3008 }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }

  log('started Fastify')
})
