import { describe, expect, it, vi } from 'vitest'
import Redis from 'ioredis'

import { Arg, Factory, Rpc } from '../src'
import { bind, createClient } from '../src/rpc/redis'

function stop(time = 1000) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), time)
  })
}
describe('redis rpc', () => {
  it('create server', async () => {
    const fn = vi.fn()
    class TestRpc {
      @Rpc('mq')
      run(arg: string) {
        fn()
        return arg
      }
    }

    const data = await Factory([TestRpc])
    const redis = new Redis('redis://localhost')

    const pub = new Redis('redis://localhost')

    bind(redis, 'test', data)

    pub.publish('test', JSON.stringify({
      args: [1],
      tag: 'TestRpc-run',

    }))

    await stop()

    expect(fn).toHaveBeenCalled()
  })
  it('create client and server', async () => {
    const fn = vi.fn()
    class TestRpc {
      @Rpc('mq')
      run(@Arg() arg: number) {
        fn()
        return arg
      }
    }

    class Faker {
      run() {
        return {
          tag: 'TestRpc-run',
          rpc: ['redis'],
        }
      }
    }

    const data = await Factory([TestRpc])
    const redis = new Redis('redis://localhost')

    const pub = new Redis('redis://localhost')

    bind(redis, 'test2', data)

    const client = await createClient(pub, 'test2', {
      test: Faker as unknown as typeof TestRpc,
    })

    expect(await client.test.run(1)).toBe(1)

    expect(fn).toHaveBeenCalled()
  })
})
