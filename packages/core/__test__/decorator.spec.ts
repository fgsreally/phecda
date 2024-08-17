import { describe, expect, it, vi } from 'vitest'
import { Assign, Effect, Err, If, Init, Isolate, get, invokeInit } from '../src'

describe('decorators', () => {
  it('init', async () => {
    class A {
      isReady = false
      @Init
      async _init() {
        await Promise.resolve()
        this.isReady = true
      }
    }

    const i1 = new A()
    await invokeInit(i1)

    expect(i1.isReady).toBeTruthy()
    const i2 = new A()
    await invokeInit(i2)

    expect(i2.isReady).toBeTruthy()
  })

  it('Err', async () => {
    const fn = vi.fn()
    class Test {
      @Err(fn, true)
      invoke() {
        this.error()
      }

      @Err(fn)
      throw() {
        this.error()
      }

      error() {
        throw new Error('invoke error')
      }
    }
    const i = new Test()
    invokeInit(i)

    i.invoke()
    expect(fn).toBeCalled()

    expect(i.throw.bind(i)).toThrowError('invoke error')
  })

  it('If & Isolate', () => {
    @If(true, Isolate)
    class Test1 {

    }
    @If(false, Isolate)
    class Test2 {

    }

    expect(get(Test1.prototype, 'isolate')).toBeTruthy()
    expect(get(Test2.prototype, 'isolate')).toBeFalsy()
  })

  it('Assign', async () => {
    @Assign(() => new Promise(resolve => resolve({ key: 'test2' })))
    class Test {
      key = 'test'
    }
    const instance = new Test() as any
    await invokeInit(instance)
    expect(instance.key).toBe('test2')
  })

  it('Effect', async () => {
    const fn = vi.fn(v => v)
    class Test {
      @Effect(fn)
      key = 10
    }

    const instance = new Test() as any
    await invokeInit(instance)
    expect(instance.key).toBe(10)
    expect(instance.$_key).toBe(10)

    instance.key = 20
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveReturnedWith(20)
    expect(instance.key).toBe(20)
  })
})
