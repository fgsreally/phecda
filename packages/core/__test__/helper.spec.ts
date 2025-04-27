import { describe, expect, it } from 'vitest'
import { Empty, Expose, Required, Tag, addDecoToClass, getMergedMeta, getMetaKey, getTag, isPhecda, omit, partial, setMeta } from '../src'

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
  it('add decorator', () => {
    class Test {
      name: string
    }

    @Tag('test2')
    class Test2 extends Test {
    }

    addDecoToClass(Test, 'name', Expose)
    expect(getMetaKey(Test)).toMatchSnapshot()
    addDecoToClass(Test, undefined, Tag('test'))
    expect(getTag(Test)).toBe('test')
    expect(getTag(Test2)).toBe('test2')
  })

  it('Pick', () => {
    function Test(value: any): any {
      return (target: any, key?: PropertyKey, index?: number) => {
        setMeta(target, key, index, { data: value })
      }
    }

    @Test(0)
    class A {
      @Test(1)
      name = 'A'

      @Test(2)
      setName(@Test(3) name: string) {
        this.name = name
        return name
      }
    }

    //

    const B = omit(A, 'name')

    expect(getMergedMeta(A, 'name').data).toBe(1)
    expect(getMergedMeta(B, 'setName').data === getMergedMeta(A, 'setName').data).toBeTruthy()
    expect(getMergedMeta(B, 'setName', 0).data === getMergedMeta(A, 'setName', 0).data).toBeTruthy()
    expect(getMergedMeta(B, 'name').data).toBeUndefined()
    expect((new B() as any).name).toBeUndefined()
  })

  it('Partial', () => {
    class A {
      @Required
      name = 'A'
    }

    //

    const B = partial(A, 'name')

    expect(getMergedMeta(A, 'name').required).toBeTruthy()
    expect(getMergedMeta(B, 'name').required).toBeFalsy()
  })
})
