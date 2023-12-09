import { describe, expect, it, vi } from 'vitest'
import amqp from 'amqplib'
import { Arg, Factory, Rpc } from '../src'
import { bind, createClient } from '../src/rpc/rabbitmq'

function stop(time = 1000) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), time)
  })
}
describe('rabbitmq rpc', () => {
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
    const conn = await amqp.connect('amqp://localhost')

    const ch = await conn.createChannel()
    const pub = await conn.createChannel()

    await bind(ch, 'test', data)

    pub.sendToQueue('test', Buffer.from(JSON.stringify({
      args: [1],
      tag: 'TestRpc-run',
    })))

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
          rpc: ['mq'],
        }
      }
    }

    const data = await Factory([TestRpc])
    const conn = await amqp.connect('amqp://localhost')

    const clientCh = await conn.createChannel()
    const serverCh = await conn.createChannel()

    await bind(serverCh, 'test', data)

    const client = await createClient(clientCh, 'test', {
      test: Faker as unknown as typeof TestRpc,
    })

    expect(await client.test.run(1)).toBe(1)

    expect(fn).toHaveBeenCalled()
  })
})
