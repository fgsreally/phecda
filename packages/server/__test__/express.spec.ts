import { describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import { To } from 'phecda-core'
import { bindApp } from '../src/server/express'
import { Body, Controller, ERROR_SYMBOL, Exception, Factory, Get, Guard, Interceptor, Param, Pipe, Plugin, Post, Query, addGuard, addInterceptor, addPipe, addPlugin } from '../src'
describe('express ', () => {
  it('simple request', async () => {
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
  })
  it('complex request', async () => {
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

    const res2 = await request(app).post('/__PHECDA_SERVER__').send([
      {
        tag: 'B-test',
        args: ['phecda', 'server', '1'],
      },

    ])
    expect(res2.body[0]).toEqual('phecda-server-1')
  })

  it('exception filter', async () => {
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
    expect(res1.body).toEqual({ description: 'Http exception', message: 'test error', status: 500, [ERROR_SYMBOL]: true })
  })
  it('Pipe', async () => {
    class Info {
      @To((p) => {
        if (p !== 'phecda')
          throw new Error('name should be phecda')
        return p
      })
      name: string
    }
    class D {
      @Post('/:test')
      test(@Param('test') @Pipe('add') test: string, @Body('info') info: Info) {
        return `${test}-${info.name}`
      }
    }
    addPipe('add', ({ arg }) => {
      return arg + 1
    })
    const data = await Factory([D])
    const app = express()
    app.use(express.json())

    bindApp(app, data)
    const res1 = await request(app).post('/test').send({ info: { name: '' } })
    expect(res1.body).toMatchObject({ message: 'name should be phecda', [ERROR_SYMBOL]: true })

    const res2 = await request(app).post('/test').send({ info: { name: 'phecda' } })
    expect(res2.text).toBe('test1-phecda')
  })

  it('plugin', async () => {
    const fn = vi.fn()

    class A {
      @Get('/test')
      @Plugin('test')
      test() {
        return { msg: 'test' }
      }
    }

    addPlugin('test', (_req: Request, _res: Response, next: () => void) => {
      fn()
      next()
    })
    const data = await Factory([A])
    const app = express()
    app.use(express.json())

    bindApp(app, data, { plugins: ['test'] })
    await request(app).get('/test')
    expect(fn).toHaveBeenCalledTimes(1)
    await request(app).post('/__PHECDA_SERVER__').send([{
      tag: 'A-test',
      args: [],
    }])

    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('guard/interceptor', async () => {
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
      [ERROR_SYMBOL]: true,
    })
    await request(app).post('/test')
    expect(fn).toHaveBeenCalledTimes(4)
  })

  it('guard/interceptor(parallel request)', async () => {
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
    await request(app).post('/__PHECDA_SERVER__').send(
      [
        {
          tag: 'E-test',
          args: ['test1'],
        },
        {
          tag: 'E-test',
          args: ['test2'],
        },
      ],

    )

    expect(Guardfn).toHaveBeenCalledTimes(4)

    expect(fn).toHaveBeenCalledTimes(8)
  })
})
