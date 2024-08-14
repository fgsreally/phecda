import { describe, expect, it } from 'vitest'
import { Clear, Ignore, SHARE_KEY, addDecoToClass, getExposeKey, getMeta, getOwnExposeKey, getPhecdaFromTarget, setExposeKey, setMeta } from '../src'

describe('extends won\'t pollute namespace', () => {
  it('getPhecdaFromTarget', () => {
    function Test(target: any, key: any) {
      setExposeKey(target, key)
    }
    class A {
      @Test
      a: string
    }

    expect(getPhecdaFromTarget(A) === getPhecdaFromTarget(new A())).toBeTruthy()
    expect(getPhecdaFromTarget(A) === getPhecdaFromTarget(A.prototype)).toBeTruthy()
  })
  it('expose keys', () => {
    function Test(target: any, key?: any) {
      setExposeKey(target, key)
    }

    @Test
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

    @Ignore
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

    expect(getExposeKey(D)).not.toContain(SHARE_KEY)
    expect(getExposeKey(D)).toMatchSnapshot()
    expect(getOwnExposeKey(D)).toMatchSnapshot()

    expect(getExposeKey(E)).toContain(SHARE_KEY)
    expect(getExposeKey(E)).toMatchSnapshot()
    expect(getOwnExposeKey(E)).toMatchSnapshot()
  })

  it('setMeta', () => {
    function Test(value: any) {
      return (target: any, key: any) => {
        setMeta(target, key, value)
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

    expect(getMeta(B, 'x')).toMatchSnapshot()
    expect(getMeta(C, 'x')).toMatchSnapshot()
  })

  it('clear', () => {
    function Test(value: any) {
      return (target: any, key?: any) => {
        setMeta(target, key, value)
      }
    }

    @Test({ tag: 'A' })

    class A {
      @Test({ a: 1, b: 0 })
      x: string
    }

    class B extends A {
      @Clear
      @Test({ b: 1 })
      x: string
    }

    @Clear
    class C extends B {
      @Test({ c: 1 })
      x: string
    }
    expect(getMeta(A)).toEqual({ tag: 'A' })

    expect(getMeta(B, 'x')).toEqual({ b: 1 })
    expect(getMeta(C, 'x')).toEqual({ b: 1, c: 1 })
    addDecoToClass(C, 'x', Clear)
    expect(getMeta(C, 'x')).toEqual({ c: 1 })

    expect(getMeta(B)).toEqual({ tag: 'A' })
    expect(getMeta(new B())).toEqual({ tag: 'A' })

    expect(getMeta(C)).toEqual({})
  })
})
