import { describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import { Rule } from 'phecda-core'
import { addGuard, addInterceptor, bindApp } from '../src/server/express'
import { Exception, Factory } from '../src'
import { Body, Controller, Get, Guard, Interceptor, Param, Post, Query } from '../src/decorators'
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

    const res2 = await request(app).post('/__PHECDA_SERVER__').send({ category: 'series', data: [{ tag: 'A-test' }] })
    expect(res2.body[0]).toEqual({ msg: 'test' })
  })
  it('express app will fill params', async () => {
    @Controller('/base')
    class B {
      @Post('/:test')
      test(@Param('test') test: string, @Body('name') name: string, @Query('id') id: string) {
        return `${test}-${name}-${id}`
      }
    }
    const data = await Factory([B])
    const app = express()
    app.use(express.json())

    bindApp(app, data)

    const res1 = await request(app).post('/base/phecda?id=1').send({ name: 'server' })
    expect(res1.text).toBe('phecda-server-1')

    const res2 = await request(app).post('/__PHECDA_SERVER__').send({
      category: 'series',
      data: [
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
          tag: 'B-test',
        },
      ],
    })
    expect(res2.body[0]).toEqual('phecda-server-1')
  })

  it('express app will handle exception and error', async () => {
    class C {
      @Get('/test')
      test() {
        throw new Exception('test error', 500)
      }
    }
    const data = await Factory([C])
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
    class D {
      @Post('/:test')
      test(@Param('test') test: string, @Body('info') info: Info) {
        return `${test}-${info.name}`
      }
    }

    const data = await Factory([D])
    const app = express()
    app.use(express.json())

    bindApp(app, data)
    const res1 = await request(app).post('/test').send({ info: { name: '' } })
    expect(res1.body).toMatchObject({ message: 'name should be phecda', error: true })
  })
  it('guard/interceptor will work', async () => {
    const fn = vi.fn((str: string) => str)
    @Interceptor('test')
    class E {
      @Guard('test')
      @Interceptor('test')
      @Interceptor('test2')

      @Post('/:test')
      test(@Param('test') test: string) {
        return `${test}`
      }
    }
    addGuard('test', (_tag, { request }: any) => {
      if (request.params.test !== 'test')
        return false
      return true
    })

    const mockInterceptor = () => {
      fn('start')
      return () => {
        fn('end')
      }
    }
    addInterceptor('test', mockInterceptor)
    addInterceptor('test2', mockInterceptor)

    const data = await Factory([E])
    const app = express()
    app.use(express.json())

    bindApp(app, data)
    const res1 = await request(app).post('/no')
    expect(res1.body).toMatchObject({
      message: 'Guard exception--test',
      status: 403,
      error: true,
    })
    await request(app).post('/test')
    expect(fn).toHaveBeenCalledTimes(4)
  })

  it('guard/interceptor in parallel', async () => {
    const fn = vi.fn((str: string) => str)
    const Guardfn = vi.fn((str: string) => str)

    @Interceptor('test')
    class E {
      @Guard('test')
      @Interceptor('test')

      @Post('/:test')
      test(@Param('test') test: string) {
        return `${test}`
      }
    }
    addGuard('test', () => {
      Guardfn('1')
      return true
    })

    addGuard('test2', () => {
      Guardfn('2')
      return true
    })
    const mockInterceptor = () => {
      fn('start')
      return () => {
        fn('end')
      }
    }
    addInterceptor('test', mockInterceptor)
    addInterceptor('test2', mockInterceptor)

    const data = await Factory([E])
    const app = express()
    app.use(express.json())

    bindApp(app, data, {
      globalGuards: ['test2'],
      globalInterceptors: ['test2'],
    })
    await request(app).post('/__PHECDA_SERVER__').send({
      category: 'parallel',
      data: [
        {
          query: {
          },
          params: {
            test: 'phecda',
          },
          body: {
          },
          tag: 'E-test',
        },
      ],
    })

    expect(Guardfn).toHaveBeenCalledTimes(2)

    expect(fn).toHaveBeenCalledTimes(4)
  })
})
