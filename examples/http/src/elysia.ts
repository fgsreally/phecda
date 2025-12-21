import '@bogeychan/elysia-polyfills/node/index.js'

import { bind } from 'phecda-server/elysia'
import { Factory, HTTPGenerator } from 'phecda-server'
import { Elysia } from 'elysia'
import { TestController } from './modules/test.controller'
const data = await Factory([TestController], {
  generators: [new HTTPGenerator()],
})
const app = new Elysia()

app.group('/base', (app) => {
  bind(app, data,{
    parallelRoute: '/__PHECDA_SERVER__',
  })
  return app
})
app.listen(3008, () => {
  // eslint-disable-next-line no-console
  console.log('start elysia server...')
})
