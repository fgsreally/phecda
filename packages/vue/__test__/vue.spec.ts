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
    const fn = vi.fn((info: string) => `info:${info}`)
    class ErrorMaker {
      name: string
      testA(param: any) {
        throw new Error(param)
      }

      @Err(fn)
      testB(param: any) {
        throw new Error(param)
      }

      @Err(fn)
      async testC(param: any) {
        return Promise.reject(param)
      }
    }
    // work with useR
    const ret = useR(ErrorMaker)
    expect(() => ret.testA('A')).toThrowError('A')
    expect(ret.testB('B')).toBe('info:Error: B')
    expect(await ret.testC('C')).toBe('info:C')
    expect(fn).toHaveBeenCalledTimes(2)

    // work with useV
    const { testA, testB, testC } = useV(ErrorMaker)
    expect(() => testA('A')).toThrowError('A')
    expect(testB('B')).toBe('info:Error: B')
    expect(await testC('C')).toBe('info:C')
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
