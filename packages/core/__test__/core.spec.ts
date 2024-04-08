import { describe, expect, it } from 'vitest'
import { Clear, Ignore, addDecoToClass, getExposeKey, getOwnExposeKey, getOwnIgnoreKey, getPhecdaFromTarget, getState, setState, setStateKey } from '../src'

describe('extends won\'t populate namespace', () => {
  it('getPhecdaFromTarget', () => {
    function Test(target: any, key: any) {
      setStateKey(target, key)
    }
    class A {
      @Test
      a: string
    }

    expect(getPhecdaFromTarget(A) === getPhecdaFromTarget(new A())).toBeTruthy()
    expect(getPhecdaFromTarget(A) === getPhecdaFromTarget(A.prototype)).toBeTruthy()
  })
  it('expose keys', () => {
    function Test(target: any, key: any) {
      setStateKey(target, key)
    }
    class A {
      @Test
      a: string
    }

    class B extends A {
      @Test
      b: string
    }

    class C extends A {
      @Test
      c: string
    }

    class D extends C {
      @Ignore
      c: string
    }

    class E extends D {
      c: string
      @Test
      e: string
    }

    expect(getExposeKey(B)).toMatchSnapshot()
    expect(getOwnExposeKey(B)).toMatchSnapshot()
    expect(getExposeKey(C)).toMatchSnapshot()
    expect(getOwnExposeKey(C)).toMatchSnapshot()
    expect(getExposeKey(D)).toMatchSnapshot()
    expect(getOwnIgnoreKey(D)).toMatchSnapshot()

    expect(getExposeKey(E)).toMatchSnapshot()
    expect(getOwnExposeKey(E)).toMatchSnapshot()
  })

  it('setState', () => {
    function Test(value: any) {
      return (target: any, key: any) => {
        setState(target, key, value)
      }
    }
    class A {
      @Test({ a: 1, b: 0 })
      x: string
    }

    class B extends A {
      @Test({ b: 1 })
      x: string
    }

    class C extends A {
      @Test({ c: 1 })
      x: string
    }

    expect(getState(B, 'x')).toMatchSnapshot()
    expect(getState(C, 'x')).toMatchSnapshot()
  })

  it('clear', () => {
    function Test(value: any) {
      return (target: any, key: any) => {
        setState(target, key, value)
      }
    }
    class A {
      @Test({ a: 1, b: 0 })
      x: string
    }

    class B extends A {
      @Clear
      @Test({ b: 1 })
      x: string
    }

    class C extends B {
      @Test({ c: 1 })
      x: string
    }

    expect(getState(B, 'x')).toEqual({ b: 1 })
    expect(getState(C, 'x')).toEqual({ b: 1, c: 1 })
    addDecoToClass(C, 'x', Clear)
    expect(getState(C, 'x')).toEqual({ c: 1 })
  })
})
