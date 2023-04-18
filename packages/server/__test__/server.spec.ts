import { describe, expect, it } from 'vitest'
import { Pcontext } from '../src/context'
import { HttpException } from '../src'
import { Pmeta } from '../src/meta'
describe('Pcontext', () => {
  const meta = new Pmeta({
    route: {
      type: 'get' as const,
      route: '/test',
    },
    params: [{ type: 'body', index: 0, key: 'name', validate: false }],
    guards: [],
    header: {},
    middlewares: [],
    interceptors: [],
    method: 'test',
    name: 'A',
  }, [])
  const server = new Pcontext('test', meta)
  it('Pcontext will handle obj', async () => {
    const handler = server.methodToHandler((name: string) => name)
    expect(await handler({ body: { name: 'test' } })).toBe('test')
  })

  it('Pcontext will handle exception', async () => {
    const handler = server.methodToHandler(() => {
      throw new HttpException('test error', 500)
    })
    expect(await handler({ body: { name: 'test' } })).toMatchObject({ status: 500, message: 'test error' })
  })
  it('Pcontext will handle error', async () => {
    const handler = server.methodToHandler(() => {
      throw new Error('test error')
    })
    expect(await handler({ body: { name: 'test' } })).toMatchObject({ message: 'test error' })
  })
})
