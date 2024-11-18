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
          func: 'guard',
          args: ['test1'],
        },
        {
          tag: 'Test',
          func: 'guard',
          args: ['test2'],
        },
      ],

    )

    expect(Guardfn).toHaveBeenCalledTimes(7)
  })

  it('ctx', async () => {
    addGuard('g', async (ctx: HttpCtx) => {
      expect({ body: ctx.body, query: ctx.query, params: ctx.params }).toMatchSnapshot()
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
}
