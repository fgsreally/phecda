/* eslint-disable no-console */
import Koa from 'koa'
import { koaBody } from 'koa-body'
import Router from '@koa/router'
import { bind } from 'phecda-server/koa'
import { Factory, HTTPGenerator } from 'phecda-server'
import { TestController } from './modules/test.controller'
const data = await Factory([TestController], {
  generators: [new HTTPGenerator()],
})
const app = new Koa()
const router = new Router({
  prefix: '/base',
})

app.use(koaBody())

bind(router, data)
app.use(router.routes()).use(router.allowedMethods())

app.listen(3008, () => {
  console.log('started Koa')
})
