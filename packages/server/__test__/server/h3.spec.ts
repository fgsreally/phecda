import { describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { createApp as createH3, createRouter, toNodeListener } from 'h3'
import type { H3Ctx } from '../../src/server/h3'
import type { HttpOptions } from '../../src'

import { bind } from '../../src/server/h3'
import { ERROR_SYMBOL, Factory, addFilter, addGuard, addInterceptor, addPipe, addPlugin } from '../../src'
import { Test } from '../fixtures/test.controller'

async function createServer(opts?: HttpOptions) {
  const data = await Factory([Test])
  const app = createH3()
  const router = createRouter()
  bind(router, data, opts)
  app.use(router)
  return toNodeListener(app)
}

describe('h3 ', () => {
  it('basic request', async () => {
    const app = await createServer()
    const res1 = await request(app).get('/get')
    expect(res1.body.msg).toBe('test')
    const res2 = await request(app).post('/post/phecda?id=1').send({ name: 'server' })
    expect(res2.text).toBe('phecda-server-1')

    const res3 = await request(app).post('/__PHECDA_SERVER__').send([
      {
        tag: 'Test',
        func: 'post',
        args: ['phecda', 'server', '1'],
      }, {
        tag: 'Test',
        func: 'get',

        args: [],
      },

    ])
    expect(res3.body[0]).toEqual('phecda-server-1')
    expect(res3.body[1]).toEqual({ msg: 'test' })
  })

  it('filter', async () => {
    const app = await createServer()

    addFilter('test', (e) => {
      return { ...e.data, filter: true }
    })
    // default filter
    const res1 = await request(app).get('/error?msg=test')
    expect(res1.body).toEqual({ description: 'Exception', message: 'test', status: 500, [ERROR_SYMBOL]: true })
    // specfic filter--test
    const res2 = await request(app).get('/filter')
    expect(res2.body).toEqual({ description: 'Exception', message: 'filter error', status: 500, [ERROR_SYMBOL]: true, filter: true })
  })
  it('pipe', async () => {
    const app = await createServer()

    addPipe('add', ({ arg }) => {
      return arg + 1
    })

    // default pipe
    const res1 = await request(app).post('/pipe').send({ info: { name: '' } })

    expect(res1.body).toMatchObject({ message: 'name should be phecda', [ERROR_SYMBOL]: true })
    // specfic pipe--add
    const res2 = await request(app).post('/pipe').query({ id: '1' }).send({ info: { name: 'phecda' } })
    expect(res2.text).toBe('11-phecda')
  })

  it('global filter/pipe', async () => {
    const fn = vi.fn()
    addPipe('express', ({ arg }) => {
      fn()
      return arg
    })
    addFilter('express', (e) => {
      fn()
      return e.data
    })
    const app = await createServer({ globalPipe: 'express', globalFilter: 'express' })
    await request(app).get('/error?msg=test')
    expect(fn).toBeCalledTimes(2)
  })

  it('plugin', async () => {
    const fn = vi.fn()

    const plugin = () => {
      return () => {
        fn()
      }
    }
    addPlugin('p1', plugin)
    addPlugin('p2', plugin)

    const app = await createServer({ parallelPlugins: ['p1'], globalPlugins: ['p2'] })

    await request(app).get('/plugin')
    expect(fn).toHaveBeenCalledTimes(2)
    await request(app).post('/__PHECDA_SERVER__').send([{
      tag: 'Test',
      func: 'plugin',
      args: [],
    }])

    expect(fn).toHaveBeenCalledTimes(4)
  })

  it('guard/interceptor', async () => {
    const InterceptFn = vi.fn((str: string) => str)
    const Guardfn = vi.fn((str: string) => str)

    addGuard('g1', ({ params, index }: H3Ctx) => {
      Guardfn('g1')
      if (index === undefined && params.test !== 'test')
        return false
      return true
    })
    addGuard('g2', () => {
      Guardfn('g2')
      return true
    })

    const mockInterceptor = (ctx: H3Ctx) => {
      InterceptFn('start')
      return () => {
        InterceptFn('end')
        if (!ctx.parallel)
          return { ps: true }
      }
    }
    addInterceptor('i1', mockInterceptor)
    addInterceptor('i2', mockInterceptor)

    const app = await createServer({
      globalGuards: ['g1'],
      globalInterceptors: ['i1'],
    })
    const res1 = await request(app).post('/aop/no')
    expect(res1.body).toMatchObject({
      message: 'Guard exception--[g1]',
      status: 403,
      [ERROR_SYMBOL]: true,
    })
    expect(Guardfn).toHaveBeenCalledTimes(1)
    expect(InterceptFn).toHaveBeenCalledTimes(0)

    await request(app).post('/aop/test').expect(200, { ps: true })

    expect(Guardfn).toHaveBeenCalledTimes(3)
    expect(InterceptFn).toHaveBeenCalledTimes(3)

    await request(app).post('/__PHECDA_SERVER__').send(
      [
        {
          tag: 'Test',
          func: 'aop',
          args: ['test1'],
        },
        {
          tag: 'Test',
          func: 'aop',

          args: ['test2'],
        },
      ],

    )

    expect(InterceptFn).toHaveBeenCalledTimes(11)

    expect(Guardfn).toHaveBeenCalledTimes(7)
  })
  it('ctx', async () => {
    addGuard('g', (ctx: H3Ctx) => {
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
          func: 'all',

          args: ['test', { name: 'test' }, '1'],
        },
        {
          tag: 'Test',
          func: 'all',

          args: ['test', { name: 'test' }, '2'],
        },
      ],

    ).expect(200)
  })
})
