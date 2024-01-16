import express from 'express'
import { describe, expect, it } from 'vitest'
import Fastify from 'fastify'
import { Body, Controller, Factory, Param, Post, Put, Query } from '../src'
import { bindApp } from '../src/server/fastify'
import { TestFactory, TestHttp } from '../src/test'

describe('test utils', () => {
  it('TestFactory', async () => {
    class X {
      add(n1: number, n2: number) {
        return n1 + n2
      }
    }
    const { get } = await TestFactory(X)

    expect(get(X).add(1, 1)).toBe(2)
  })
  it('testHttp', async () => {
    @Controller('/base')
    class B {
      context: any
      @Post('/:test')
      string(@Param('test') test: string, @Body('name') name: string, @Query('id') id: string) {
        return `${test}-${name}-${id}`
      }

      @Put('/:test')
      json(@Param('test') test: string, @Body('name') name: string, @Query('id') id: string) {
        return { key: `${test}-${name}-${id}` }
      }
    }
    const data = await Factory([B])
    const app = Fastify()
    // app.use(express.json())

    app.register(bindApp(data))

    const { get } = await TestHttp(app)

    await get(B).string('test', 'name', 'id').expect(200, 'test-name-id')
    await get(B).json('test', 'name', 'id').expect(200, { key: 'test-name-id' })
  })
})
