import { describe, expect, it, vi } from 'vitest'
import { Assign, Bind, Effect, Empty, Expose, Ignore, Init, Nested, Pipeline, Tag, To, addDecoToClass, classToValue, getBind, getExposeKey, getTag, injectProperty, isPhecda, plainToClass, registerParallel, registerSerial, transformClass } from '../src/index'
describe('validate&transform', () => {
  class Parent {
    @To((p, i, k) => {
      if (p !== 'phecda')
        throw new Error(`${getTag(i)}.${k} should be phecda`)

      return p + 1
    })
    name: string

    get fullname() {
      return `${this.name}-core`
    }

    changeName() {
      this.name = 'phecda-changed'
    }
  }
  it('plainToClass', async () => {
    // false
    const instance = plainToClass(Parent, { name: 'phecda11' })
    const err = await transformClass(instance)
    expect(err[0]).toBe('Parent.name should be phecda')

    const instance2 = plainToClass(Parent, { name: 'phecda' })

    await transformClass(instance2)
    expect(instance2.name).toBe('phecda1')
    expect(instance2.fullname).toBe('phecda1-core')

    instance2.changeName()

    expect(instance2.name).toBe('phecda-changed')
    expect(instance2.fullname).toBe('phecda-changed-core')
  })

  it('classToValue', () => {
    const instance = plainToClass(Parent, { name: 'phecda' })
    expect(classToValue(instance)).toMatchSnapshot()
  })

  it('extend', async () => {
    class Child extends Parent {
      @To((str: string) => {
        if (str.length >= 5)
          throw new Error('name should be short')

        return str
      })
      @Ignore
      name: string
    }
    const instance = plainToClass(Child, { name: 'phecda11', age: '1' })
    const err = await transformClass(instance, true)
    expect(err.length).toBe(2)
    expect(err[0]).toBe('name should be short')
    expect(classToValue(instance)).toMatchSnapshot()
  })

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

  it('use function to add decorator', () => {
    class Test {
      name: string
    }

    addDecoToClass(Test, 'name', Expose)
    expect(getExposeKey(new Test() as any)).toMatchSnapshot()
  })
  it('Assign', async () => {
    @Assign(() => new Promise(resolve => resolve({ key: 'test2' })))
    class Test {
      key = 'test'
    }
    const instance = new Test() as any
    await registerSerial(instance)
    expect(instance.key).toBe('test2')
  })

  it('bind', () => {
    class Test {
      @Bind('phecda')
      key: string
    }
    expect(getBind(Test).key).toBe('phecda')
  })

  it('Effect', async () => {
    const fn = vi.fn(v => v)
    class Test {
      @Effect('phecda')
      key = 10
    }

    injectProperty('effect-phecda', ({ value }: any) => {
      fn(value)
    })
    const instance = new Test() as any
    await registerSerial(instance)
    expect(instance.key).toBe(10)
    expect(instance.$_key).toBe(10)

    instance.key = 20
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveReturnedWith(20)
    expect(instance.key).toBe(20)
  })

  it('Nested', async () => {
    class B {
      @To(v => v + 1)
      b: number

      change() {
        this.b++
      }
    }
    class A {
      @Nested(B)
      b: B
    }

    const instance = plainToClass(A, { b: { b: 0 } })
    await transformClass(instance)
    expect(instance.b.b).toBe(1)
    instance.b.change()
    expect(instance.b.b).toBe(2)
  })

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
    await transformClass(instance, true)
    expect(instance.count).toBe(2)
  })

  it('init', async () => {
    class A {
      isReady = false
      @Init
      async _init() {
        await Promise.resolve()
        this.isReady = true
      }
    }

    const i1 = new A()
    await registerParallel(i1 as any)

    expect(i1.isReady).toBeTruthy()
    const i2 = new A()
    await registerSerial(i2 as any)

    expect(i2.isReady).toBeTruthy()
  })
})
