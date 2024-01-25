/* eslint-disable no-console */
/* eslint-disable import/first */

console.time('cold-start')
import { bindApp } from 'phecda-server/koa'
import { Factory } from 'phecda-server'
import Koa from 'koa'
import { koaBody } from 'koa-body'
import Router from '@koa/router'
import { AppController } from './app.controller'
async function start() {
  const data = await Factory([AppController])
  const router = new Router()

  const app = new Koa()

  app.use(koaBody())
  bindApp(router, data)
  app.use(router.routes()).use(router.allowedMethods())

  app.listen(process.env.PORT, () => {
    console.timeEnd('cold-start')
    console.log(`phecda-server/koa started on port ${process.env.PORT}`)
  })
}

start()
