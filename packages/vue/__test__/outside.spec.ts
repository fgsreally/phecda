import { describe, expect, it, vi } from 'vitest'
import { Err, Init, wait } from 'phecda-web'
import { Isolate, Tag, Watcher, createPhecda, emitter, getR, getV } from '../src/index'

declare module 'phecda-web' {

  interface Events {
    test: string
  }
}

describe('outside setup function', () => {
  const phecda = createPhecda()

  it('watcher', async () => {
    class WatchPlayer {
      name: string
      @Watcher('test')
      updateName(name: string) {
        this.name = name
      }
    }
    const { name } = getV(WatchPlayer, phecda)

    expect(name.value).toBeUndefined()

    emitter.emit('test', 'phecda')
    expect(name.value).toBe('phecda')
  })
  it('error handler', async () => {
    const fn = vi.fn((err: Error) => `${err.message}`)
    class ErrorMaker {
      name: string
      testA(param: any) {
        throw new Error(param)
      }

      @Err(fn, true)
      invoke() {
        throw new Error('invoke error')
      }

      @Err(fn, false)
      async throw() {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject('throw error')
      }
    }
    // work with getR
    const ret = getR(ErrorMaker, phecda)
    ret.invoke()
    expect(fn).toHaveLastReturnedWith('invoke error')
    await expect(ret.throw()).rejects.toThrow('throw error')
    expect(fn).toHaveBeenCalledTimes(2)

    // work with getV
    const { invoke, throw: ThrowError } = getV(ErrorMaker, phecda)

    invoke()
    expect(fn).toHaveLastReturnedWith('invoke error')
    await expect(ThrowError()).rejects.toThrow('throw error')

    expect(fn).toHaveBeenCalledTimes(4)
  })

  it('wait', async () => {
    let isInit = false
    class A {

    }
    class B {
      @Init
      _init() {
        return Promise.resolve().then(() => isInit = true)
      }
    }

    await wait(getR(A, phecda), getR(B, phecda))
    expect(isInit).toBeTruthy()
  })

  it('Isolate', async () => {
    @Isolate
    @Tag('unique')
    class A {

    }

    const a = getR(A, phecda)
    expect(a === getR(A, phecda)).toBeFalsy()
  })
})
