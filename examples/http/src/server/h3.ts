import { createServer } from 'node:http'
import { createApp, createRouter, toNodeListener, useBase } from 'h3'
import { bind } from 'phecda-server/h3'
import { Factory, HTTPGenerator, log } from 'phecda-server'
import { TestController } from './test.controller'
const data = await Factory([TestController], {
  generators: [new HTTPGenerator()],

})
const app = createApp()
const router = createRouter()
bind(router, data)
app.use('/base', useBase('', router.handler))

createServer(toNodeListener(app)).listen(3008, () => {
  log('start h3 server...')
})
