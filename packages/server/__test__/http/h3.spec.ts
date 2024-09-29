import { describe } from 'vitest'
import { createApp as createH3, createRouter, toNodeListener } from 'h3'
import type { HttpOptions } from '../../src'

import { bind } from '../../src/http/h3'
import { Factory } from '../../src'
import { Test } from '../fixtures/test.controller'
import { httpFrameworkTestSuite } from './utils'

async function createServer(opts?: HttpOptions) {
  const data = await Factory([Test])
  const app = createH3()
  const router = createRouter()
  bind(router, data, opts)
  app.use(router)
  return toNodeListener(app)
}

describe('h3 ', () => {
  httpFrameworkTestSuite(createServer, 'h3')
  // h3 doesn't support route middleware
  // it('addon', async () => {
  //   const fn = vi.fn()
  //   const addon = (router) => {
  //     router.use('/__PHECDA_SERVER__', fromNodeMiddleware((_req, _res, next) => {
  //       fn()
  //       next()
  //     }))
  //   }
  //   addAddon('a1', addon)
  //   addAddon('a2', addon)

  //   const app = await createServer({ parallelAddons: ['a1'], globalAddons: ['a2'] })

  //   await request(app).get('/addon')
  //   expect(fn).toHaveBeenCalledTimes(2)
  //   await request(app).post('/__PHECDA_SERVER__').send([{
  //     tag: 'Test',
  //     func: 'addon',
  //     args: [],
  //   }])
  //   expect(fn).toHaveBeenCalledTimes(4)
  // })
})
