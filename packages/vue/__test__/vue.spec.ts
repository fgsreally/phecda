import { describe, expect, it, vi } from 'vitest'
import { Err } from 'phecda-core'
import { Watcher, emit, useR, useV } from '../src/index'
describe('work for vue', () => {
  it('watcher', async () => {
    class WatchPlayer {
      name: string
      @Watcher('test')
      updateName(name: string) {
        this.name = name
      }
    }
    const { name } = useV(WatchPlayer)

    expect(name.value).toBeUndefined()

    emit('test', 'phecda')
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
})
