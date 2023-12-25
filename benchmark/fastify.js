console.time('cold-start')

const fastify = require('fastify')({ logger: false })

fastify.post('/hello', (req, reply) => {
  reply.send(req.body)
})

fastify.listen({ port: process.env.PORT }, () => {
  console.timeEnd('cold-start')
  fastify.log.info(`Fastify listening on port${process.env.PORT}`)
})
