import { describe, expect, it } from 'vitest'
import { Expose, getMergedMeta, getMeta, getMetaParmas, getPhecdaFromTarget, setMeta } from '../src'

describe('set meta', () => {
  it('getPhecdaFromTarget', () => {
    class A {
      @Expose
      a: string
    }

    expect(getPhecdaFromTarget(A) === getPhecdaFromTarget(new A())).toBeTruthy()
    expect(getPhecdaFromTarget(A) === getPhecdaFromTarget(A.prototype)).toBeTruthy()
  })

  function Test(value: any): any {
    return (target: any, key?: PropertyKey, index?: number) => {
      setMeta(target, key, index, { data: value })
    }
  }

  const mockData = {
    a: { a: 1, b: 0, arr: [0, 1] },
    b: { b: 1, arr: [0, 2] },
    c: { c: 1 },
  }

  const expectData = {
    data: {
      a: 1,
      b: 1,
      c: 1,
      arr: [1, 0, 2],
    },
  }

  it('set meta to method', () => {
    class A {
      @Test(mockData.a)
      x(@Test(mockData.a) name: string) {
        return name
      }
    }

    class B extends A {
      @Test(mockData.b)
      x(@Test(mockData.b) name: string) {
        return name
      }
    }

    class C extends B {
      @Test(mockData.c)
      x(@Test(mockData.c) name: string) {
        return name
      }
    }

    expect(getMetaParmas(B, 'x')).toMatchSnapshot()
    expect(getMeta(B, 'x')).toMatchSnapshot()
    expect(getMeta(B, 'x', 0)).toMatchSnapshot()

    expect(getMetaParmas(C, 'x')).toMatchSnapshot()
    expect(getMeta(C, 'x')).toMatchSnapshot()
    expect(getMeta(C, 'x', 0)).toMatchSnapshot()

    expect(getMergedMeta(C, 'x')).toEqual(expectData)
    expect(getMergedMeta(C, 'x', 0)).toEqual(expectData)
  })

  it('set meta to class', () => {
    @Test(mockData.a)

    class A {
      constructor(@Test(mockData.a) protected name: string) {

      }
    }
    @Test(mockData.b)

    class B extends A {
      constructor(@Test(mockData.b) protected name: string) {
        super(name)
      }
    }

    @Test(mockData.c)
    class C extends B {
      constructor(@Test(mockData.c) protected name: string) {
        super(name)
      }
    }

    expect(getMetaParmas(B)).toMatchSnapshot()
    expect(getMeta(B)).toMatchSnapshot()
    expect(getMeta(B, undefined, 0)).toMatchSnapshot()
    expect(getMetaParmas(C)).toMatchSnapshot()
    expect(getMeta(C)).toMatchSnapshot()
    expect(getMeta(C, undefined, 0)).toMatchSnapshot()
    expect(getMergedMeta(C)).toEqual(expectData)
    expect(getMergedMeta(C, undefined, 0)).toEqual(expectData)
  })
})
