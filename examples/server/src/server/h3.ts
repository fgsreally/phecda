import { createServer } from 'node:http'
import { createApp, createRouter, toNodeListener, useBase } from 'h3'
import { bindApp } from 'phecda-server/h3'
import { Factory } from 'phecda-server'
import { TestController } from './test.controller'
const data = await Factory([TestController], {
  http: 'pmeta.js',
})
const app = createApp()
const router = createRouter()
bindApp(router, data)
app.use('/base', useBase('', router.handler))
createServer(toNodeListener(app)).listen(3007)
