import fs from 'fs'
import { bindApp } from 'phecda-server/fastify'

import { Factory, addFilter, addPlugin } from 'phecda-server'
import Fastify from 'fastify'
import { TestController } from './test.controller'

const data = await Factory([TestController], {
  http: 'pmeta.js',
})
const fastify = Fastify({
  logger: true,
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
// addPlugin('test', (fastify, _, done) => {
//   fastify.addHook('onRequest', (_request, reply, done) => {
//     reply.header('X-Custom-Header', 'default')

//     done()
//   })
//   done()
// })

fastify.register(bindApp(data), {
  prefix: '/base',
})

fastify.listen({ port: 3008 }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }

  // eslint-disable-next-line no-console
  console.log('start listening..')
})
