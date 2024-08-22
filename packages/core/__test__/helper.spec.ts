import { describe, expect, it } from 'vitest'
import { Empty, Expose, Tag, addDecoToClass, getMetaKey, getTag, isPhecda } from '../src'

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
})
