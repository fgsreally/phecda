import EventEmitter from 'node:events'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import amqp from 'amqplib'
import { Arg, Ctx, Exception, Factory, Filter, Guard, Pipe, Queue, Rpc, addFilter, addGuard, addPipe } from '../../src'
import { bind } from '../../src/rpc/rabbitmq'

describe('rabbitmq rpc', () => {
  let conn: amqp.Connection
  let pub: amqp.Channel
  let sub: amqp.Channel

  const emitter = new EventEmitter()

  let index = 0
  async function init() {
    const clientQueue = `client_${++index}`
    await pub.assertQueue(clientQueue)
    pub.consume(clientQueue, (msg) => {
      if (!msg)
        return
      const data = JSON.parse(msg.content.toString())
      emitter.emit(data.id, data.data, data.error)
    })

    return clientQueue
  }

  async function send(data: any, queue?: string) {
    const clientQueue = await init()
    pub.sendToQueue(queue ?? 'TestRpc', Buffer.from(JSON.stringify({
      args: [data],
      tag: 'TestRpc',
      func: 'run',
      _ps: 1,
      queue: clientQueue,
      id: `${index}`,
    })))
    return new Promise((resolve, reject) => {
      emitter.once(`${index}`, (data, error) => {
        if (error)
          reject(data)
        else
          resolve(data)
      })
    })
  }
  beforeEach(async () => {
    conn = await amqp.connect('amqp://localhost')
    pub = await conn.createChannel()
    sub = await conn.createChannel()
  })
  afterEach(() => {
    emitter.removeAllListeners()
    return conn.close()
  })
  it('create server', async () => {
    const fn = vi.fn()

    @Rpc()
    class TestRpc {
      @Ctx
      ctx: any

      @Queue('test queue')

      run(@Arg arg: number) {
        expect(this.ctx).toBeDefined()
        fn()
        return arg
      }
    }

    const data = await Factory([TestRpc])

    await bind(sub, data)

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

    await bind(sub, data)

    expect(await send(1)).toBe(2)
  })

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

    await bind(sub, data)

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

    await bind(sub, data)
    await expect(send(1)).rejects.toEqual({ error: true, info: 'rpc error' })
  })
})
