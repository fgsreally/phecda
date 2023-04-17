import { describe, expectTypeOf, it } from 'vitest'
import { toReq } from '../src/client'

describe('types ', () => {
  it('handle transform ', () => {
    class A {
      test(name: Wrap<string, number>, id: string) {

      }
    }
    const { test } = new A()
    expectTypeOf(test).toEqualTypeOf<Meta>()
  })
})
