import { describe, expect, it, vi } from 'vitest'
import { Kafka } from 'kafkajs'
import { Arg, Exception, Factory, Filter, Guard, Interceptor, Pipe, Rpc, addFilter, addGuard, addInterceptor, addPipe } from '../../src'
import { bind, createClient } from '../../src/rpc/kafka'

function stop(time = 1000) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), time)
  })
}
describe('kafka rpc', () => {
  class Faker {
    run() {
      return {
        tag: 'TestRpc-run',
        rpc: ['kafka'],
      }
    }
  }

  it('create server', async () => {
    const fn = vi.fn()
    class TestRpc {
      @Rpc('kafka')
      run(arg: string) {
        fn()
        return arg
      }
    }

    const data = await Factory([TestRpc])
    const kafka = new Kafka({
      clientId: 'test-client-1',
      brokers: ['test'],
    })

    const producer = kafka.producer()
    await producer.connect()

    await bind(kafka, 'test', data)

    producer.send({
      topic: 'test',
      messages: [
        {
          value: JSON.stringify({
            tag: 'TestRpc-run',
            args: [1],
          }),
        },
      ],
    })

    await stop()

    expect(fn).toHaveBeenCalled()
  })
  it('create client and server', async () => {
    const fn = vi.fn()
    class TestRpc {
      @Rpc('kafka')
      run(@Arg() arg: number) {
        fn()
        return arg
      }
    }
    const kafka = new Kafka({
      clientId: 'test-client-1',
      brokers: ['test'],
    })

    const data = await Factory([TestRpc])

    await bind(kafka, 'test2', data)

    const client = await createClient(kafka, 'test2', {
      test: Faker as unknown as typeof TestRpc,
    })

    expect(await client.test.run(1)).toBe(1)
    expect(await client.test.run(2)).toBe(2)

    expect(fn).toHaveBeenCalled()
  })

  it('guard', async () => {
    addGuard('g1', (ctx) => {
      expect(ctx.tag).toBe('TestRpc-run')

      return true
    })
    class TestRpc {
      @Rpc('kafka')
      @Guard('g1')
      run(@Arg() arg: number) {
        expect(arg).toBe(1)
        return ++arg
      }
    }

    const data = await Factory([TestRpc])
    const kafka = new Kafka({
      clientId: 'test-client-1',
      brokers: ['test'],
    })

    await bind(kafka, 'test3', data)

    const client = await createClient(kafka, 'test3', {
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
      @Rpc('kafka')
      @Interceptor('i1')
      run(@Arg() arg: number) {
        expect(arg).toBe(1)
        return ++arg
      }
    }

    const data = await Factory([TestRpc])
    const kafka = new Kafka({
      clientId: 'test-client-1',
      brokers: ['test'],
    })

    await bind(kafka, 'test4', data)

    const client = await createClient(kafka, 'test4', {
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
      @Rpc('kafka')
      run(@Pipe('test') @Arg() arg: number) {
        expect(arg).toBe('1')
        return arg
      }
    }

    const data = await Factory([TestRpc])
    const kafka = new Kafka({
      clientId: 'test-client-1',
      brokers: ['test'],
    })

    await bind(kafka, 'test5', data)

    const client = await createClient(kafka, 'test5', {
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
      @Rpc('kafka')
      @Filter('test')
      run() {
        throw new Exception('just for test', 0)
      }
    }
    const data = await Factory([TestRpc])
    const kafka = new Kafka({
      clientId: 'test-client-1',
      brokers: ['test'],
    })

    await bind(kafka, 'test6', data)

    const client = await createClient(kafka, 'test6', {
      test: Faker as unknown as typeof TestRpc,
    })
    await expect(client.test.run()).rejects.toEqual({ error: true, info: 'rpc error' })
  })
})
