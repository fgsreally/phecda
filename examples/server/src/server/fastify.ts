import { bindApp } from 'phecda-server/fastify'

import { Factory, addPlugin } from 'phecda-server'
import Fastify from 'fastify'
import { TestController } from './test.controller'

const data = await Factory([TestController], {
  http: 'pmeta.js',
})
const fastify = Fastify({
  logger: false,
})

addPlugin('test',(fastify)=>{
  fastify.addHook('onRequest', (request, reply, done) => {
    // 通过 options 配置项传递自定义头部的值
    const customHeaderValue =  'Default-Value';

    // 设置自定义头部
    reply.header('X-Custom-Header', customHeaderValue);

    // 继续处理请求
    done();
  });
})



fastify.register(bindApp(data), {
  prefix: '/base',
})
fastify.listen({ port: 3007 }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }

  // eslint-disable-next-line no-console
  console.log('start listening..')
})
