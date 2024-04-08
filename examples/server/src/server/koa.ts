/* eslint-disable no-console */
import Koa from 'koa'
import { koaBody } from 'koa-body'
import Router from '@koa/router'
import { bind } from 'phecda-server/koa'
import { Factory } from 'phecda-server'
import { TestController } from './test.controller'
const data = await Factory([TestController], {
  http: 'pmeta.js',
})
const app = new Koa()
const router = new Router({
  prefix: '/base',
})

app.use(koaBody())

bind(router, data)
app.use(router.routes()).use(router.allowedMethods())

app.listen(3008, () => {
  console.log(' started Koa')
})
