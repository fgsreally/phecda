import { createServer } from 'node:http'
import express from 'express'
import { describe, expect, it } from 'vitest'
import Fastify from 'fastify'
import { createApp, createRouter, toNodeListener } from 'h3'
import { Body, Controller, Factory, Get, Param, Post, Put, Query } from '../src'
import { bindApp as bindExpress } from '../src/server/express'
import { bindApp as bindFastify } from '../src/server/fastify'
import { bindApp as bindH3 } from '../src/server/h3'

import { TestFactory, TestHttp } from '../src/test'
describe('test utils', () => {
  @Controller('/base')
  class Http {
    name: string

    @Get('')
    get() {
      return 'get'
    }

    @Post('/:test')
    string(@Param('test') test: string, @Body('name') name: string, @Query('id') id: string) {
      return `${test}-${name}-${id}`
    }

    @Put('/:test')
    json(@Param('test') test: string, @Body('name') name: string, @Query('id') id: string) {
      return { key: `${test}-${name}-${id}` }
    }
  }
  it('TestFactory', async () => {
    class X {
      add(n1: number, n2: number) {
        return n1 + n2
      }
    }
    const { get } = await TestFactory(X)

    expect(get(X).add(1, 1)).toBe(2)
  })

  it('testHttp(express)', async () => {
    // express
    const data = await Factory([Http])
    const app = express()
    app.use(express.json())
    const router = express.Router()
    app.use(router)
    bindExpress(router, data)

    const { module } = await TestHttp(app, data)

    await module(Http).get().expect(200, 'get')

    await module(Http).string('test', 'name', 'id').expect(200, 'test-name-id')
    await module(Http).json('test', 'name', 'id').expect(200, { key: 'test-name-id' })
  })
  it('testHttp(fastify)', async () => {
    // express
    const data = await Factory([Http])
    const app = Fastify()
    app.register(bindFastify(app, data))

    await app.ready()
    const { module } = await TestHttp(app.server, data)
    await module(Http).get().expect(200, 'get')
    await module(Http).string('test', 'name', 'id').expect(200, 'test-name-id')
    await module(Http).json('test', 'name', 'id').expect(200, { key: 'test-name-id' })
  })

  it('testHttp(h3)', async () => {
    // express
    const data = await Factory([Http])
    const app = createApp()
    const router = createRouter()
    bindH3(router, data)
    app.use(router)

    const { module } = await TestHttp(createServer(toNodeListener(app)), data)
    await module(Http).get().expect(200, 'get')

    await module(Http).string('test', 'name', 'id').expect(200, 'test-name-id')
    await module(Http).json('test', 'name', 'id').expect(200, { key: 'test-name-id' })
  })
})
