import '@bogeychan/elysia-polyfills/node/index.js'

import { bind } from 'phecda-server/elysia'
import { Factory, HTTPGenerator } from 'phecda-server'
import { Elysia } from 'elysia'
import { TestController } from './test.controller'
const data = await Factory([TestController], {
  generators: [new HTTPGenerator('.ps/http.ts')],
})
const app = new Elysia()

app.group('/base', (app) => {
  bind(app, data)
  return app
})
app.listen(3008)
