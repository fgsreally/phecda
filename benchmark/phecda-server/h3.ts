/* eslint-disable no-console */
/* eslint-disable import/first */

console.time('cold-start')
import { createServer } from 'node:http'
import { createApp, createRouter, toNodeListener } from 'h3'
import { bindApp } from 'phecda-server/h3'
import { Factory } from 'phecda-server'
import { AppController } from './app.controller'
async function start() {
  const data = await Factory([AppController])
  const app = createApp()
  const router = createRouter()
  bindApp(router, data)
  app.use(router)
  createServer(toNodeListener(app)).listen(process.env.PORT, () => {
    console.timeEnd('cold-start')
    console.log(`phecda-server/h3 started on port ${process.env.PORT}`)
  })
}

start()
