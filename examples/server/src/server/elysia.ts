import '@bogeychan/elysia-polyfills/node/index.js'

import { bind } from 'phecda-server/elysia'
import { Factory } from 'phecda-server'
import { Elysia } from 'elysia'
import { TestController } from './test.controller'
const data = await Factory([TestController], {
  http: 'pmeta.js',
})
const app = new Elysia()

app.group('/base', (app) => {
  bind(app, data)
  return app
})
app.listen(3008)
