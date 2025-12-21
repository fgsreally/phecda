import { serve } from '@hono/node-server'

import { bind } from 'phecda-server/hono'
import { Factory, HTTPGenerator, log } from 'phecda-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { TestController } from './modules/test.controller'
const data = await Factory([TestController], {
  generators: [new HTTPGenerator()],

})
const app = new Hono()
const router = new Hono()
app.use(cors())
bind(router, data,{
  parallelRoute: '/__PHECDA_SERVER__',
})
app.route('/base', router)

serve({
  fetch: app.fetch,
  port: 3008,

}, () => log('start hono server...'))
