import { describe, expect, it } from 'vitest'
import { Expose, Pipeline, Rule, To, classToPlain, getTag, plainToClass, transformInstance, transformInstanceAsync, transformProperty, transformPropertyAsync } from '../src/index'
describe('validate&transform', () => {
  class Parent {
    @To((p, i, k) => {
      if (p !== 'phecda')
        throw new Error(`${getTag(i) as string}.${k} should be phecda`)

      return p + 1
    })
    @Rule(async (p) => {
      return p === 'phecda'
    }, 'Parent.name should be phecda')
    name: string

    get fullname() {
      return `${this.name}-core`
    }

    @Expose
    testId: string

    changeName() {
      this.name = 'phecda-changed'
    }
  }
  it('plainToClass', async () => {
    // base validate
    const i1 = plainToClass(Parent, { name: 'phecda11' })
    expect(transformInstance(i1, true)).toEqual(['Parent.name should be phecda'])
    expect(transformProperty(i1, 'name', true)).toEqual(['Parent.name should be phecda'])

    expect(await transformInstanceAsync(i1, true)).toEqual(['Parent.name should be phecda', 'Parent.name should be phecda'])
    expect(await transformPropertyAsync(i1, 'name', true)).toEqual(['Parent.name should be phecda', 'Parent.name should be phecda'])

    expect(i1).toMatchSnapshot()

    const i2 = plainToClass(Parent, { name: 'phecda' })
    expect(i2).toMatchSnapshot()
    transformInstance(i2)
    expect(i2.name).toBe('phecda1')
    expect(i2.fullname).toBe('phecda1-core')
    i2.changeName()
    expect(i2.name).toBe('phecda-changed')
    expect(i2.fullname).toBe('phecda-changed-core')
  })

  it('classToPlain', () => {
    const instance = plainToClass(Parent, { name: 'phecda' })
    expect(classToPlain(instance)).toMatchSnapshot()
  })

  it('extend', async () => {
    class Child extends Parent {
      @To((str: string) => {
        if (str.length >= 5)
          throw new Error('name should be short')

        return str
      })
      name: string
    }
    const instance = plainToClass(Child, { name: 'phecda11', age: '1' })
    const err = transformInstance(instance, true)
    expect(err.length).toBe(2)
    expect(err[0]).toBe('name should be short')
    expect(classToPlain(instance)).toMatchSnapshot()
  })

  // it('Nested', async () => {
  //   class B {
  //     @To(v => v + 1)
  //     b: number

  //     change() {
  //       this.b++
  //     }
  //   }
  //   class A {
  //     @Nested(B)
  //     b: B
  //   }

  //   const instance = plainToClass(A, { b: { b: 0 } })
  //   await transformInstance(instance)
  //   expect(instance.b.b).toBe(1)
  //   instance.b.change()
  //   expect(instance.b.b).toBe(2)
  // })

  it('pipeline', async () => {
    class Test {
      @Pipeline(

        To((num: number) => {
          return ++num
        }),
        To((num: number) => {
          return ++num
        }))
      count: number
    }

    const instance = plainToClass(Test, { count: 0 })
    await transformInstance(instance, true)
    expect(instance.count).toBe(2)
  })
})
