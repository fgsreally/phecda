import { describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import { Rule } from 'phecda-core'
import { bindApp } from '../src/server/express'
import { Factory } from '../src/core'
import { Body, Controller, Get, Guard, Interceptor, Param, Post, Query } from '../src/decorators'
import { HttpException, addGuard, addInterceptor } from '../src'
describe('express ', () => {
  it('express app will bind phecda-middleware', async () => {
    class A {
      @Get('/test')
      test() {
        return { msg: 'test' }
      }
    }
    const data = await Factory([A])
    const app = express()
    app.use(express.json())

    bindApp(app, data)
    const res1 = await request(app).get('/test')
    expect(res1.body.msg).toBe('test')

    const res2 = await request(app).post('/__PHECDA_SERVER__').send([{ name: 'A-test' }])
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
    const data = await Factory([A])
    const app = express()
    app.use(express.json())

    bindApp(app, data)

    const res1 = await request(app).post('/base/phecda?id=1').send({ name: 'server' })
    expect(res1.text).toBe('phecda-server-1')

    const res2 = await request(app).post('/__PHECDA_SERVER__').send([
      {
        query: {
          id: '1',
        },
        params: {
          test: 'phecda',
        },
        body: {
          name: 'server',
        },
        name: 'A-test',
      },
    ])
    expect(res2.body[0]).toEqual('phecda-server-1')
  })

  it('express app will handle exception and error', async () => {
    class A {
      @Get('/test')
      test() {
        throw new HttpException('test error', 500)
      }
    }
    const data = await Factory([A])
    const app = express()
    app.use(express.json())

    bindApp(app, data)

    const res1 = await request(app).get('/test')
    expect(res1.body).toEqual({ description: 'Http exception', message: 'test error', status: 500, error: true })
  })
  it('pipe will validate data', async () => {
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

    const data = await Factory([A])
    const app = express()
    app.use(express.json())

    bindApp(app, data)
    const res1 = await request(app).post('/test').send({ info: { name: '' } })
    expect(res1.body).toMatchObject({ message: 'name should be phecda', error: true })
  })
  it('guard/interceptor will work', async () => {
    const fn = vi.fn((str: string) => str)

    class A {
      @Guard('test')
      @Interceptor('test')
      @Post('/:test')
      test(@Param('test') test: string) {
        return `${test}`
      }
    }
    addGuard('test', (req) => {
      if (req.params.test !== 'test')
        return false
      return true
    })
    addInterceptor('test', () => {
      fn('start')
      return () => {
        fn('end')
      }
    })
    const data = await Factory([A])
    const app = express()
    app.use(express.json())

    bindApp(app, data)
    const res1 = await request(app).post('/no')
    expect(res1.body).toMatchObject({"message": "Guard exception--test",
       "status": 403, error: true })
    await request(app).post('/test')
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
