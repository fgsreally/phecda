import { describe, expect, it, vi } from 'vitest'
import request from 'supertest'

import fastify from 'fastify'
import { bind } from '../../src/http/fastify'
import type { HttpOptions } from '../../src'
import { Factory, addAddon } from '../../src'
import { Test } from '../fixtures/test.controller'
import { httpFrameworkTestSuite } from './utils'

async function createServer(opts?: HttpOptions) {
  const data = await Factory([Test])
  const app = fastify()
  bind(app, data, opts)
  await app.ready()
  return app.server
}

describe('fastify ', () => {
  httpFrameworkTestSuite(createServer, 'fastify')

  it('addon', async () => {
    const fn = vi.fn()
    const addon = (fastify) => {
      fastify.addHook('onRequest', (request, reply, done) => {
        // 其他代码
        fn()
        done()
      })
    }

    addAddon('a1', addon)
    addAddon('a2', addon)

    const app = await createServer({ parallelAddons: ['a1'], globalAddons: ['a2'] })

    await request(app).get('/addon')
    expect(fn).toHaveBeenCalledTimes(2)
    await request(app).post('/__PHECDA_SERVER__').send([{
      tag: 'Test',
      func: 'addon',
      args: [],
    }])
    expect(fn).toHaveBeenCalledTimes(4)
  })
})
