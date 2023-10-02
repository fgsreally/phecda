import { describe, expect, it } from 'vitest'
import { getExposeKey, getOwnExposeKey, getState, setModelVar, setState } from '../src'

describe('extends won\'t populate namespace', () => {
  it('modelVar', () => {
    function Test(target: any, key: any) {
      setModelVar(target, key)
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
    const instanceB: any = new B()
    const instanceC: any = new C()

    expect(getExposeKey(instanceB)).toMatchSnapshot()
    expect(getOwnExposeKey(instanceB)).toMatchSnapshot()
    expect(getExposeKey(instanceC)).toMatchSnapshot()
    expect(getOwnExposeKey(instanceC)).toMatchSnapshot()
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

    const instanceB = new B()
    const instanceC = new C()
    expect(getState(instanceB as any, 'x')).toMatchSnapshot()
    expect(getState(instanceC as any, 'x')).toMatchSnapshot()
  })
})
