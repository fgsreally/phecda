import { describe, expect, it, vi } from 'vitest'
import { Err, Init } from 'phecda-web'
import { createApp } from 'vue'
import { Isolate, Tag, Watcher, createPhecda, defaultWebInject, emitter, useO, useR, useV, waitUntilInit } from '../src/index'
describe('work for vue', () => {
  it('watcher', async () => {
    createApp({}).use(createPhecda())
    defaultWebInject()

    class WatchPlayer {
      name: string
      @Watcher('test')
      updateName(name: string) {
        this.name = name
      }
    }
    const { name } = useV(WatchPlayer)

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
    const ret = useR(ErrorMaker)
    ret.invoke()
    expect(fn).toHaveLastReturnedWith('invoke error')
    await expect(ret.throw()).rejects.toThrow('throw error')
    expect(fn).toHaveBeenCalledTimes(2)

    // work with useV
    const { invoke, throw: ThrowError } = useV(ErrorMaker)

    invoke()
    expect(fn).toHaveLastReturnedWith('invoke error')
    await expect(ThrowError()).rejects.toThrow('throw error')

    expect(fn).toHaveBeenCalledTimes(4)
  })

  it('waitUntilInit', async () => {
    let isInit = false
    class A {

    }
    class B {
      @Init
      _init() {
        return Promise.resolve().then(() => isInit = true)
      }
    }

    await waitUntilInit(useO(A), useO(B))
    expect(isInit).toBeTruthy()
  })

  it('Isolate', async () => {
    @Isolate
    @Tag('unique')
    class A {

    }

    const a = useR(A)
    expect(a === useR(A)).toBeFalsy()
  })
})
