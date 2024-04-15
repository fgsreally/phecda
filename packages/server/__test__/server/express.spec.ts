import { describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import type { ExpressCtx } from '../../src/server/express'
import { bind } from '../../src/server/express'
import type { ServerOptions as Options } from '../../src'
import { ERROR_SYMBOL, Factory, addGuard, addInterceptor, addPipe, addPlugin } from '../../src'
import { Test } from '../fixtures/test.controller'

async function createServer(opts?: Options) {
  const data = await Factory([Test])
  const app = express()
  app.use(express.json())
  const router = express.Router()
  bind(router, data, opts)
  app.use(router)
  return app
}

describe('express ', () => {
  it('basic request', async () => {
    const app = await createServer()
    const res1 = await request(app).get('/get')
    expect(res1.body.msg).toBe('test')
    const res2 = await request(app).post('/post/phecda?id=1').send({ name: 'server' })
    expect(res2.text).toBe('phecda-server-1')

    const res3 = await request(app).post('/__PHECDA_SERVER__').send([
      {
        tag: 'Test',
        method: 'post',
        args: ['phecda', 'server', '1'],
      }, {
        tag: 'Test',
        method: 'get',

        args: [],
      },

    ])
    expect(res3.body[0]).toEqual('phecda-server-1')
    expect(res3.body[1]).toEqual({ msg: 'test' })
  })

  it('exception filter', async () => {
    const app = await createServer()

    const res1 = await request(app).get('/error')
    expect(res1.body).toEqual({ description: 'Http exception', message: 'test error', status: 500, [ERROR_SYMBOL]: true })
  })
  it('Pipe', async () => {
    const app = await createServer()

    addPipe('add', ({ arg }) => {
      return arg + 1
    })

    const res1 = await request(app).post('/pipe').send({ info: { name: '' } })

    expect(res1.body).toMatchObject({ message: 'name should be phecda', [ERROR_SYMBOL]: true })

    const res2 = await request(app).post('/pipe').query({ id: '1' }).send({ info: { name: 'phecda' } })
    expect(res2.text).toBe('11-phecda')
  })

  it('plugin', async () => {
    const fn = vi.fn()

    addPlugin('p1', (_req: Request, _res: Response, next: () => void) => {
      fn()
      next()
    })

    const app = await createServer({ plugins: ['p1'] })

    await request(app).get('/plugin')
    expect(fn).toHaveBeenCalledTimes(1)
    await request(app).post('/__PHECDA_SERVER__').send([{
      tag: 'Test',
      method: 'plugin',
      args: [],
    }])

    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('guard/interceptor', async () => {
    const InterceptFn = vi.fn((str: string) => str)
    const Guardfn = vi.fn((str: string) => str)

    addGuard('g1', ({ params, index }: ExpressCtx) => {
      Guardfn('g1')

      if (index === undefined && params.test !== 'test')
        return false
      return true
    })
    addGuard('g2', () => {
      Guardfn('g2')
      return true
    })

    const mockInterceptor = () => {
      InterceptFn('start')
      return () => {
        InterceptFn('end')
      }
    }
    addInterceptor('i1', mockInterceptor)
    addInterceptor('i2', mockInterceptor)

    const app = await createServer({
      globalGuards: ['g2'],
      globalInterceptors: ['i2'],
    })
    const res1 = await request(app).post('/aop/no')
    expect(res1.body).toMatchObject({
      message: 'Guard exception--g1',
      status: 403,
      [ERROR_SYMBOL]: true,
    })
    await request(app).post('/aop')
    expect(Guardfn).toHaveBeenCalledTimes(2)

    await request(app).post('/__PHECDA_SERVER__').send(
      [
        {
          tag: 'Test',
          method: 'aop',
          args: ['test1'],
        },
        {
          tag: 'Test',
          method: 'aop',

          args: ['test2'],
        },
      ],

    )

    expect(InterceptFn).toHaveBeenCalledTimes(8)

    expect(Guardfn).toHaveBeenCalledTimes(6)
  })
  it('ctx', async () => {
    addGuard('g', (ctx: ExpressCtx) => {
      expect({ body: ctx.body, query: ctx.query, params: ctx.params }).toMatchSnapshot()
      return true
    })

    const app = await createServer({
      globalGuards: ['g'],
    })

    await request(app).post('/all/test?id=1').send({ name: 'test' }).expect(200, ['test', { name: 'test' }, '1'])
    await request(app).post('/__PHECDA_SERVER__').send(
      [
        {
          tag: 'Test',
          method: 'all',

          args: ['test', { name: 'test' }, '1'],
        },
        {

          tag: 'Test',
          method: 'all',

          args: ['test', { name: 'test' }, '2'],
        },
      ],

    ).expect(200)
  })
})
