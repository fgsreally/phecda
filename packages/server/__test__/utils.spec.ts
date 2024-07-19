import { expect, test } from 'vitest'
import { Mixin, ServerBase, Tag, addDecoToClass } from '../src'

test('Mixin', () => {
  class Test {
    constructor(
      public data: any,
    ) { }

    get Data() {
      return this.data
    }

    getData() {
      return this.data
    }
  }

  class MyClass extends Mixin(ServerBase, Test) {

  }

  const instance = new MyClass({ name: 'phecda-server' })

  expect(instance.data).toEqual({ name: 'phecda-server' })

  expect(instance.Data === instance.data).toBe(true)
  expect(instance.getData() === instance.data).toBe(true)

  expect(instance.tag).toBe('MyClass')

  addDecoToClass(MyClass, undefined, Tag('MyTester'))
  expect(new MyClass().tag).toBe('MyTester')
})
