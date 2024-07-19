import { expect, test } from 'vitest'
import { Mixin, Tag, getParamtypes } from '../src'
test('Mixin can\'t extends metadata', () => {
  @Tag('a')
  class A {

  }

  @Tag('b')
  class B {

  }

  @Tag('c')
  class C {
    constructor(protected a: A) { }
  }

  @Tag('d')
  class D {
    constructor(protected b: B) { }
  }

  @Tag('tester')
  class Tester extends Mixin(C, D) {

  }

  expect(getParamtypes(Tester)).toBeUndefined()
})
