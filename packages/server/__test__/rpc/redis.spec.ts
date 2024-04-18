import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Redis } from 'ioredis'

import { Arg, Ctx, Exception, Factory, Filter, Guard, Interceptor, Pipe, Queue, Rpc, addFilter, addGuard, addInterceptor, addPipe } from '../../src'
import { bind, createClient } from '../../src/rpc/redis'

function stop(time = 500) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), time)
  })
}
describe('redis rpc', () => {
  let sub: Redis, pub: Redis

  beforeEach(() => {
    sub = new Redis('redis://localhost')

    pub = sub.duplicate()
  })

  afterEach(() => {
    sub.removeAllListeners('message')
  })

  class Faker {
    run() {
      return {
        tag: 'TestRpc',
        rpc: ['redis'],
      }
    }
  }

  it('create server', async () => {
    const fn = vi.fn()
    class TestRpc {
      @Ctx
      ctx: any

      @Queue('create server')
      @Rpc()
      run(arg: string) {
        expect(this.ctx).toBeDefined()
        fn()
        return arg
      }
    }

    const data = await Factory([TestRpc])

    bind(sub, pub, data)

    pub.publish('create server', JSON.stringify({
      args: [1],
      method: 'run',
      tag: 'TestRpc',
    }))

    await stop()

    expect(fn).toHaveBeenCalled()
  })

  it('create client and server', async () => {
    const fn = vi.fn()
    class TestRpc {
      @Rpc()
      run(@Arg() arg: number) {
        fn()
        return arg
      }
    }

    const data = await Factory([TestRpc])

    bind(sub, pub, data)

    const client = await createClient(pub, sub, {
      test: Faker as unknown as typeof TestRpc,
    })

    expect(await client.test.run(1)).toBe(1)

    expect(fn).toHaveBeenCalled()
  })

  it('guard', async () => {
    addGuard('g1', (ctx) => {
      expect(ctx.tag).toBe('TestRpc')

      return true
    })
    class TestRpc {
      @Rpc()
      @Guard('g1')
      run(@Arg() arg: number) {
        expect(arg).toBe(1)
        return ++arg
      }
    }

    const data = await Factory([TestRpc])

    bind(sub, pub, data)

    const client = await createClient(pub, sub, {
      test: Faker as unknown as typeof TestRpc,
    })

    expect(await client.test.run(1)).toBe(2)
  })

  it('interceptor', async () => {
    addInterceptor('i1', (ctx) => {
      expect(ctx.tag).toBe('TestRpc')
      return (ret: number) => {
        expect(ret).toBe(2)
        return ++ret
      }
    })
    class TestRpc {
      @Rpc()
      @Interceptor('i1')
      run(@Arg() arg: number) {
        expect(arg).toBe(1)
        return ++arg
      }
    }

    const data = await Factory([TestRpc])

    bind(sub, pub, data)

    const client = await createClient(pub, sub, {
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
      @Rpc()
      run(@Pipe('test') @Arg() arg: number) {
        expect(arg).toBe('1')
        return arg
      }
    }

    const data = await Factory([TestRpc])

    bind(sub, pub, data)

    const client = await createClient(pub, sub, {
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
      @Rpc()
      @Filter('test')
      run() {
        throw new Exception('just for test', 0)
      }
    }

    const data = await Factory([TestRpc])

    bind(sub, pub, data)

    const client = await createClient(pub, sub, {
      test: Faker as unknown as typeof TestRpc,
    })

    await expect(client.test.run()).rejects.toEqual({ error: true, info: 'rpc error' })
  })
})
