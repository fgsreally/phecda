import EventEmitter from 'node:events'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Redis from 'ioredis'

import { Arg, Ctx, Exception, Factory, Filter, Guard, Pipe, Queue, Rpc, addFilter, addGuard, addPipe } from '../../src'
import { bind } from '../../src/rpc/redis'

describe('redis rpc', () => {
  let sub: Redis, pub: Redis

  const emitter = new EventEmitter()

  let index = 0
  async function init() {
    const clientQueue = `client_${++index}`

    await sub.subscribe(clientQueue)
    sub.on('message', async (channel, msg) => {
      if (channel === clientQueue && msg) {
        const data = JSON.parse(msg)
        emitter.emit(data.id, data.data, data.error)
      }
    })

    return clientQueue
  }

  async function send(data: any, queue?: string) {
    const clientQueue = await init()

    pub.publish(queue ?? 'TestRpc', JSON.stringify({
      args: [data],
      tag: 'TestRpc',
      func: 'run',
      _ps: 1,
      queue: clientQueue,
      id: `${index}`,
    }))
    return new Promise((resolve, reject) => {
      emitter.once(`${index}`, (data, error) => {
        if (error)
          reject(data)
        else
          resolve(data)
      })
    })
  }
  beforeEach(() => {
    pub = new Redis('redis://localhost')
    sub = pub.duplicate()
  })

  afterEach(() => {
    sub.removeAllListeners('message')
  })

  it('test queue', async () => {
    const fn = vi.fn()

    @Rpc()
    class TestRpc {
      @Ctx
      ctx: any

      @Queue('test queue')
      run(@Arg arg: string) {
        expect(this.ctx).toBeDefined()
        fn()
        return arg
      }
    }

    const data = await Factory([TestRpc])

    bind({ sub, pub }, data)

    expect(await send(1, 'test queue')).toBe(1)

    expect(fn).toHaveBeenCalled()
  })

  it('guard', async () => {
    addGuard('g1', (ctx) => {
      expect(ctx.tag).toBe('TestRpc')
    })

    @Rpc()
    class TestRpc {
      @Queue()
      @Guard('g1')
      run(@Arg arg: number) {
        expect(arg).toBe(1)
        return ++arg
      }
    }

    const data = await Factory([TestRpc])

    bind({ sub, pub }, data)

    expect(await send(1)).toBe(2)
  })

  // it('interceptor', async () => {
  //   addInterceptor('i1', (ctx) => {
  //     expect(ctx.tag).toBe('TestRpc')
  //     return (ret: number) => {
  //       expect(ret).toBe(2)
  //       return ++ret
  //     }
  //   })
  //   @Rpc()
  //   class TestRpc {
  //     @Queue()
  //     @Interceptor('i1')
  //     run(@Arg arg: number) {
  //       expect(arg).toBe(1)
  //       return ++arg
  //     }
  //   }

  //   const data = await Factory([TestRpc])

  //   bind({ sub, pub }, data)

  //   const client = createClient({ pub, sub }, {
  //     test: Faker as unknown as typeof TestRpc,
  //   })

  //   expect(await client.test.run(1)).toBe(3)
  // })

  it('pipe', async () => {
    addPipe('test', async ({ arg }) => {
      expect(arg).toEqual(1)
      return String(arg)
    })

    @Rpc()
    class TestRpc {
      @Queue()
      run(@Pipe('test') @Arg arg: number) {
        expect(arg).toBe('1')
        return arg
      }
    }

    const data = await Factory([TestRpc])

    bind({ sub, pub }, data)

    expect(await send(1)).toBe('1')
  })

  it('filter', async () => {
    addFilter('test', (e) => {
      expect(e.message).toBe('just for test')
      return {
        error: true,
        info: 'rpc error',
      }
    })

    @Rpc()
    class TestRpc {
      @Queue()
      @Filter('test')
      run() {
        throw new Exception('just for test', 0)
      }
    }

    const data = await Factory([TestRpc])

    bind({ sub, pub }, data)

    await expect(send(1)).rejects.toEqual({ error: true, info: 'rpc error' })
  })
})
