console.time('cold-start');

const fastify = require('fastify')({ logger: false });

fastify.post('/hello', function (req, reply) {
  reply.send(req.body);
})

fastify.listen({ port: 3003 }, () => {
  console.timeEnd('cold-start');
  fastify.log.info(`Fastify listening on 3003`)
});