import { describe, expect, it, vi } from 'vitest'
import { Assign, Bind, Effect, Empty, Err, Expose, Init, SHARE_KEY, Tag, addDecoToClass, getBind, getExposeKey, getTag, invokeHandler, isPhecda } from '../src'

describe('helper', () => {
  it('isPhecda', async () => {
    @Tag('test')
    class Test {
    }

    expect(isPhecda(Test)).toBe(true)

    @Empty
    class Test2 {
    }

    expect(isPhecda(Test2)).toBe(true)

    class Test3 {
    }

    expect(isPhecda(Test3)).toBe(false)
  })
  it('use function to add decorator', () => {
    class Test {
      name: string
    }

    addDecoToClass(Test, 'name', Expose)
    expect(getExposeKey(new Test() as any)).toMatchSnapshot()
    addDecoToClass(Test, SHARE_KEY, Tag('test'))
    expect(getTag(Test)).toBe('test')
  })
  it('Assign', async () => {
    @Assign(() => new Promise(resolve => resolve({ key: 'test2' })))
    class Test {
      key = 'test'
    }
    const instance = new Test() as any
    await invokeHandler('init', instance)
    expect(instance.key).toBe('test2')
  })

  it('bind', () => {
    class Test {
      @Bind('phecda')
          key: string
    }
    expect(getBind(Test).key).toBe('phecda')
  })

  it('Effect', async () => {
    const fn = vi.fn(v => v)
    class Test {
      @Effect(fn)
      key = 10
    }

    const instance = new Test() as any
    await invokeHandler('init', instance)
    expect(instance.key).toBe(10)
    expect(instance.$_key).toBe(10)

    instance.key = 20
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveReturnedWith(20)
    expect(instance.key).toBe(20)
  })

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
    await invokeHandler('init', i1 as any)

    expect(i1.isReady).toBeTruthy()
    const i2 = new A()
    await invokeHandler('init', i2 as any)

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
    invokeHandler('init', i as any)
    i.invoke()
    expect(fn).toBeCalled()

    expect(i.throw.bind(i)).toThrowError('invoke error')
  })
})
