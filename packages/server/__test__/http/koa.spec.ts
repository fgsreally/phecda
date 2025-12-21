import { describe, expect, it, vi } from 'vitest'
import Koa from 'koa'
import { koaBody } from 'koa-body'
import Router from '@koa/router'
import request from 'supertest'
import type { HttpOptions } from '../../src'

import { bind } from '../../src/http/koa'
import { Factory, addAddon } from '../../src'
import { Test } from '../fixtures/test.controller'
import { httpFrameworkTestSuite } from './utils'

async function createServer(opts?: HttpOptions) {
  const data = await Factory([Test])
  const app = new Koa()
  app.use(koaBody())
  const router = new Router()
  bind(router, data, {
    ...opts,
    parallelRoute: '/__PHECDA_SERVER__',
  })
  app.use(router.routes()).use(router.allowedMethods())

  return app.listen()
}

describe('koa ', () => {
  httpFrameworkTestSuite(createServer, 'koa')
  it('addon', async () => {
    const fn = vi.fn()
    const addon = (router) => {
      router.use((_ctx, next) => {
        fn()
        next()
      })
    }
    addAddon('a1', addon)
    addAddon('a2', addon)

    const app = await createServer({ parallelAddons: ['a1'], globalAddons: ['a2'] })

    await request(app).get('/addon')
    expect(fn).toHaveBeenCalledTimes(2)
    await request(app).post('/__PHECDA_SERVER__').send([{
      tag: 'Test',
      method: 'addon',
      args: [],
    }])
    expect(fn).toHaveBeenCalledTimes(4)
  })
})
