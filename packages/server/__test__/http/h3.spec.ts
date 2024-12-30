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
})
