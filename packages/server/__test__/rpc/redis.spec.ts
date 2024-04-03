import { describe, expect, it, vi } from 'vitest'
import Redis from 'ioredis'

import { Arg, Ctx, Exception, Factory, Filter, Guard, Interceptor, Pipe, Rpc, addFilter, addGuard, addInterceptor, addPipe } from '../../src'
import { bind, createClient } from '../../src/rpc/redis'

function stop(time = 500) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), time)
  })
}
describe('redis rpc', () => {
  class Faker {
    run() {
      return {
        tag: 'TestRpc-run',
        rpc: ['redis'],
      }
    }
  }

  it('create server', async () => {
    const fn = vi.fn()
    class TestRpc {
      @Ctx
      ctx: any

      @Rpc('rabbitmq')
      run(arg: string) {
        expect(this.ctx).toBeDefined()
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
      @Rpc('rabbitmq')
      run(@Arg() arg: number) {
        fn()
        return arg
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

  it('guard', async () => {
    addGuard('g1', (ctx) => {
      expect(ctx.tag).toBe('TestRpc-run')

      return true
    })
    class TestRpc {
      @Rpc('rabbitmq')
      @Guard('g1')
      run(@Arg() arg: number) {
        expect(arg).toBe(1)
        return ++arg
      }
    }

    const data = await Factory([TestRpc])
    const redis = new Redis('redis://localhost')

    const pub = new Redis('redis://localhost')

    bind(redis, 'test3', data)

    const client = await createClient(pub, 'test3', {
      test: Faker as unknown as typeof TestRpc,
    })

    expect(await client.test.run(1)).toBe(2)
  })

  it('interceptor', async () => {
    addInterceptor('i1', (ctx) => {
      expect(ctx.tag).toBe('TestRpc-run')
      return (ret: number) => {
        expect(ret).toBe(2)
        return ++ret
      }
    })
    class TestRpc {
      @Rpc('rabbitmq')
      @Interceptor('i1')
      run(@Arg() arg: number) {
        expect(arg).toBe(1)
        return ++arg
      }
    }

    const data = await Factory([TestRpc])
    const redis = new Redis('redis://localhost')

    const pub = new Redis('redis://localhost')

    bind(redis, 'test4', data)

    const client = await createClient(pub, 'test4', {
      test: Faker as unknown as typeof TestRpc,
    })

    expect(await client.test.run(1)).toBe(3)
  })

  it('pipe', async () => {
    addPipe('test', async ({ arg }) => {
      expect(arg).toEqual(1)
      return String(arg)
    })
    class TestRpc {
      @Rpc('rabbitmq')
      run(@Pipe('test') @Arg() arg: number) {
        expect(arg).toBe('1')
        return arg
      }
    }

    const data = await Factory([TestRpc])
    const redis = new Redis('redis://localhost')

    const pub = new Redis('redis://localhost')

    bind(redis, 'test5', data)

    const client = await createClient(pub, 'test5', {
      test: Faker as unknown as typeof TestRpc,
    })

    expect(await client.test.run(1)).toBe('1')
  })

  it('filter', async () => {
    addFilter('test', (e) => {
      expect(e.message).toBe('just for test')
      return {
        error: true,
        info: 'rpc error',
      }
    })
    class TestRpc {
      @Rpc('rabbitmq')
      @Filter('test')
      run() {
        throw new Exception('just for test', 0)
      }
    }

    const data = await Factory([TestRpc])
    const redis = new Redis('redis://localhost')

    const pub = new Redis('redis://localhost')

    bind(redis, 'test6', data)

    const client = await createClient(pub, 'test6', {
      test: Faker as unknown as typeof TestRpc,
    })

    await expect(client.test.run()).rejects.toEqual({ error: true, info: 'rpc error' })
  })
})
