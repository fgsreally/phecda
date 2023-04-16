import { describe, expect, it } from 'vitest'
import request from 'supertest'
import express from 'express'
import { Rule } from 'phecda-core'
import { bindApp } from '../src/express'
import { Factory } from '../src/core'
import { Body, Controller, Get, Param, Post, Query } from '../src/decorators'
import { HttpException } from '../src'
describe('express ', () => {
  it('express app will bind phecda-middleware', async () => {
    class A {
      @Get('/test')
      test() {
        return { msg: 'test' }
      }
    }
    const data = Factory([A])
    const app = express()
    app.use(express.json())

    bindApp(app, data)
    const res1 = await request(app).get('/test')
    expect(res1.body.msg).toBe('test')

    const res2 = await request(app).post('/__PHECDA_SERVER__').send({ 'A-test': {} })
    expect(res2.body[0]).toEqual({ msg: 'test' })
  })
  it('express app will fill params', async () => {
    @Controller('/base')
    class A {
      @Post('/:test')
      test(@Param('test') test: string, @Body('name') name: string, @Query('id') id: string) {
        return `${test}-${name}-${id}`
      }
    }
    const data = Factory([A])
    const app = express()
    app.use(express.json())

    bindApp(app, data)

    const res1 = await request(app).post('/base/phecda').send({ name: 'server' })
    expect(res1.text).toBe('phecda-server-1')

    const res2 = await request(app).post('/__PHECDA_SERVER__').send({
      'A-test': {
        query: {
          id: '1',
        },
        params: {
          test: 'phecda',
        },
        body: {
          name: 'server',
        },

      },
    })
    expect(res2.body[0]).toEqual('phecda-server-1')
  })

  it('express app will handle exception and error', async () => {
    class A {
      @Get('/test')
      test() {
        throw new HttpException('test error', 500)
      }
    }
    const data = Factory([A])
    const app = express()
    app.use(express.json())

    bindApp(app, data)

    const res1 = await request(app).get('/test')
    expect(res1.body).toEqual({ description: 'http exception', message: 'test error', status: 500, error: true })
  })
  it('phecda will validate data', async () => {
    class Info {
      @Rule('phecda', 'name should be phecda')
      name: string
    }
    class A {
      @Post('/:test')
      test(@Param('test') test: string, @Body('info') info: Info) {
        return `${test}-${info.name}`
      }
    }

    const data = Factory([A])
    const app = express()
    app.use(express.json())

    bindApp(app, data)
    const res1 = await request(app).post('/test').send({ info: { name: '' } })
    expect(res1.body).toMatchObject({ message: 'name should be phecda', error: true })
  })
})
