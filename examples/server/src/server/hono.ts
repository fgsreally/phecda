import { serve } from '@hono/node-server'

import { bind } from 'phecda-server/hono'
import { Factory, HTTPGenerator, log } from 'phecda-server'
import { Hono } from 'hono'
import { TestController } from './test.controller'
const data = await Factory([TestController], {
  generators: [new HTTPGenerator()],

})
const app = new Hono()
const router = new Hono()

bind(router, data)
app.route('/base', router)

serve({
  fetch: app.fetch,
  port: 3008,

}, () => log('start hono server...'))
