import { describe, expect, it, vi } from 'vitest'
import amqp from 'amqplib'
import { Arg, Ctx, Exception, Factory, Filter, Guard, Interceptor, Pipe, Queue, Rpc, addFilter, addGuard, addInterceptor, addPipe } from '../../src'
import { bind, createClient } from '../../src/rpc/rabbitmq'

function stop(time = 1000) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), time)
  })
}
describe('rabbitmq rpc', () => {
  class Faker {
    run() {
      return {
        tag: 'TestRpc',
        func: 'run',
      }
    }
  }

  it('create server', async () => {
    const fn = vi.fn()

    @Rpc()
    class TestRpc {
      @Ctx
      ctx: any

      @Queue('create server')

      run(arg: string) {
        expect(this.ctx).toBeDefined()
        fn()
        return arg
      }
    }

    const data = await Factory([TestRpc])
    const conn = await amqp.connect('amqp://localhost')

    const ch = await conn.createChannel()
    const pub = await conn.createChannel()

    await bind(ch, data)

    pub.sendToQueue('create server', Buffer.from(JSON.stringify({
      args: [1],
      tag: 'TestRpc',
      func: 'run',
      _ps: 1,
    })))

    await stop()

    expect(fn).toHaveBeenCalled()
  })
  it('create client and server', async () => {
    const fn = vi.fn()

    @Rpc()
    class TestRpc {
      @Queue()
      run(@Arg() arg: number) {
        fn()
        return arg
      }
    }

    const data = await Factory([TestRpc])
    const conn = await amqp.connect('amqp://localhost')

    const clientCh = await conn.createChannel()
    const serverCh = await conn.createChannel()

    await bind(serverCh, data)

    const client = await createClient(clientCh, {
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

    @Rpc()

    class TestRpc {
      @Queue()
      @Guard('g1')
      run(@Arg() arg: number) {
        expect(arg).toBe(1)
        return ++arg
      }
    }

    const data = await Factory([TestRpc])
    const conn = await amqp.connect('amqp://localhost')

    const clientCh = await conn.createChannel()
    const serverCh = await conn.createChannel()

    await bind(serverCh, data)

    const client = await createClient(clientCh, {
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

    @Rpc()
    class TestRpc {
      @Queue()
      @Interceptor('i1')
      run(@Arg() arg: number) {
        expect(arg).toBe(1)
        return ++arg
      }
    }

    const data = await Factory([TestRpc])
    const conn = await amqp.connect('amqp://localhost')

    const clientCh = await conn.createChannel()
    const serverCh = await conn.createChannel()

    await bind(serverCh, data)

    const client = await createClient(clientCh, {
      test: Faker as unknown as typeof TestRpc,
    })

    expect(await client.test.run(1)).toBe(3)
  })

  it('pipe', async () => {
    addPipe('test', async ({ arg }) => {
      expect(arg).toEqual(1)
      return String(arg)
    })
    @Rpc()

    class TestRpc {
      @Queue()
      run(@Pipe('test') @Arg() arg: number) {
        expect(arg).toBe('1')
        return arg
      }
    }

    const data = await Factory([TestRpc])
    const conn = await amqp.connect('amqp://localhost')

    const clientCh = await conn.createChannel()
    const serverCh = await conn.createChannel()

    await bind(serverCh, data)

    const client = await createClient(clientCh, {
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

    @Rpc()
    class TestRpc {
      @Queue()
      @Filter('test')
      run() {
        throw new Exception('just for test', 0)
      }
    }
    const data = await Factory([TestRpc])
    const conn = await amqp.connect('amqp://localhost')

    const clientCh = await conn.createChannel()
    const serverCh = await conn.createChannel()

    await bind(serverCh, data)

    const client = await createClient(clientCh, {
      test: Faker as unknown as typeof TestRpc,
    })
    await expect(client.test.run()).rejects.toEqual({ error: true, info: 'rpc error' })
  })
})
