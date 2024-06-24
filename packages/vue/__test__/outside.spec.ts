import { describe, expect, it, vi } from 'vitest'
import { Err, Init, wait } from 'phecda-web'
import { Isolate, Tag, Watcher, createPhecda, emitter, useR, useV } from '../src/index'

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
    const { name } = useV(WatchPlayer, phecda)

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
    // work with useR
    const ret = useR(ErrorMaker, phecda)
    ret.invoke()
    expect(fn).toHaveLastReturnedWith('invoke error')
    await expect(ret.throw()).rejects.toThrow('throw error')
    expect(fn).toHaveBeenCalledTimes(2)

    // work with useV
    const { invoke, throw: ThrowError } = useV(ErrorMaker, phecda)

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

    await wait(useR(A, phecda), useR(B, phecda))
    expect(isInit).toBeTruthy()
  })

  it('Isolate', async () => {
    @Isolate
    @Tag('unique')
    class A {

    }

    const a = useR(A, phecda)
    expect(a === useR(A, phecda)).toBeFalsy()
  })
})
