import { describe, expect, it } from 'vitest'
import { PhecdaServer } from '../src/server'
import { HttpException } from '../src'
import { Meta } from '../src/meta'
describe('PhecdaServer', () => {
  const meta = new Meta({
    route: {
      type: 'get' as const,
      route: '/test',
    },
    params: [{ type: 'body', index: 0, key: 'name', validate: false }],
    guards: [],
    interceptors: [],
    method: 'test',
    name: 'A',
  }, [])
  const server = new PhecdaServer('test', meta)
  it('PhecdaServer will handle obj', async () => {
    const handler = server.methodToHandler((name: string) => name)
    expect(await handler({ body: { name: 'test' } })).toBe('test')
  })

  it('PhecdaServer will handle exception', async () => {
    const handler = server.methodToHandler(() => {
      throw new HttpException('test error', 500)
    })
    expect(await handler({ body: { name: 'test' } })).toMatchObject({ status: 500, message: 'test error' })
  })
  it('PhecdaServer will handle error', async () => {
    const handler = server.methodToHandler(() => {
      throw new Error('test error')
    })
    expect(await handler({ body: { name: 'test' } })).toMatchObject({ message: 'test error' })
  })
})
