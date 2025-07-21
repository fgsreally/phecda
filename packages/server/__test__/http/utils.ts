import { expect, it, vi } from 'vitest'
import request from 'supertest'
import type { HttpCtx, HttpOptions } from '../../src'
import { ERROR_SYMBOL, ForbiddenException, addFilter, addGuard, addPipe } from '../../src'

export function httpFrameworkTestSuite<App = any>(createServer: (opts?: HttpOptions) => Promise<App>, _framework: string) {
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
        params: {
          test: 'phecda',
        },
        body: {
          name: 'server',
        },
        query: {
          id: '1',
        },
      }, {
        tag: 'Test',
        method: 'get',

      },

    ])
    expect(res3.body[0]).toEqual('phecda-server-1')
    expect(res3.body[1]).toEqual({ msg: 'test' })
  })

  it('filter', async () => {
    addFilter('test', (e) => {
      return { ...e.data, filter: true }
    })
    const app = await createServer()

    // default filter
    const res1 = await request(app).get('/error?msg=test')
    expect(res1.body).toEqual({ description: 'Exception', message: 'test', status: 500, [ERROR_SYMBOL]: true })
    // specfic filter--test
    const res2 = await request(app).get('/filter')
    expect(res2.body).toEqual({ description: 'Exception', message: 'filter error', status: 500, [ERROR_SYMBOL]: true, filter: true })
  })
  it('pipe', async () => {
    addPipe('add', ({ arg }) => {
      return arg + 1
    })
    const app = await createServer()
    const res2 = await request(app).post('/pipe').query({ id: '1' }).send({ info: { name: 'phecda' } })
    expect(res2.text).toBe('11-phecda')
  })

  it('guard', async () => {
    const Guardfn = vi.fn((str: string) => str)

    addGuard('g1', async ({ params, index }: HttpCtx) => {
      Guardfn('g1')

      if (index === undefined && params.test !== 'test')
        throw new ForbiddenException('Guard exception--[g1]')
    })
    addGuard('g2', async (_, next) => {
      Guardfn('g2')
      next()
    })

    const app = await createServer({
      globalGuards: ['g1'],
    })
    const res1 = await request(app).post('/guard/no')
    expect(res1.body).toMatchObject({
      message: 'Guard exception--[g1]',
      status: 403,
      [ERROR_SYMBOL]: true,
    })
    expect(Guardfn).toHaveBeenCalledTimes(1)

    await request(app).post('/guard/test')
    expect(Guardfn).toHaveBeenCalledTimes(3)

    await request(app).post('/__PHECDA_SERVER__').send(
      [
        {
          tag: 'Test',
          method: 'guard',
          params: {
            test: 'test1',
          },
        },
        {
          tag: 'Test',
          method: 'guard',
          params: {
            test: 'test2',
          },
        },
      ],

    )

    expect(Guardfn).toHaveBeenCalledTimes(7)
  })

  it('ctx', async () => {
    addGuard('g', async (_ctx: HttpCtx) => {
      // expect({ body: ctx.body, query: ctx.query, params: ctx.params }).toMatchSnapshot()
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
          query: {
            id: '1',
          },
          body: {
            name: 'test',
          },
          params: {
            test: 'test',
          },
        },
        {

          tag: 'Test',
          method: 'all',
          query: {
            id: '2',
          },
          body: {
            name: 'test',
          },
          params: {
            test: 'test2',
          },
        },
      ],

    ).expect(200)
  })

  it('defaultPipe', async () => {
    const app = await createServer({
    })
    const { body } = await request(app).post('/__PHECDA_SERVER__').send(
      [
        {
          tag: 'Test',
          method: 'defaultPipe',
          body: {
            a: 1,
          },
        },
        {
          tag: 'Test',
          method: 'defaultPipe',
          body: {
            b: '1',
          },
        },
        {
          tag: 'Test',
          method: 'defaultPipe',
          body: {
            c: 1,
          },
        },
        {
          tag: 'Test',
          method: 'defaultPipe',
          body: {
            d: '1',
          },
        },
        {
          tag: 'Test',
          method: 'defaultPipe',
          body: {
            e: true,
          },
        },
        {
          tag: 'Test',
          method: 'defaultPipe',
          body: {
            f: '1',
          },
        },
        {
          tag: 'Test',
          method: 'defaultPipe',
          body: {
            f: {},
          },
        },
      ],

    )
    expect(body[0].message).toEqual('param 1 is not a string')
    expect(body[1].message).toEqual('param 2 is not a number')
    expect(body[2].message).toEqual('param 3 is not a boolean')
    expect(body[3].message).toEqual('param 4 is not a valid enum value')
    expect(body[4].message).toEqual('param 5 can\'t pass one of these validations')
    expect(body[5].message).toEqual('data must be an object')
    expect(body[6].message).toEqual('it is required for "name"')
  })
}
