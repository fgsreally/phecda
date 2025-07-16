import { describe, expect, it, vi } from 'vitest'
import express from 'express'
import request from 'supertest'
import { bind } from '../../src/http/express'
import type { HttpOptions } from '../../src'
import { Factory, addAddon } from '../../src'
import { Test } from '../fixtures/test.controller'
import { httpFrameworkTestSuite } from './utils'
async function createServer(opts?: HttpOptions) {
  const data = await Factory([Test])
  const app = express()
  app.use(express.json())
  const router = express.Router()
  bind(router, data, opts)
  app.use(router)
  return app
}

describe('express ', () => {
  httpFrameworkTestSuite(createServer, 'express')

  it('addon', async () => {
    const fn = vi.fn()
    const addon = (router) => {
      router.use((_req, _res, next) => {
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
