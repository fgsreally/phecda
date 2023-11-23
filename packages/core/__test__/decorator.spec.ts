import { describe, expect, it, vi } from 'vitest'
import { Assign, Bind, Effect, Empty, Expose, Ignore, Pipe, Rule, Tag, addDecoToClass, classToValue, getBind, getExposeKey, injectProperty, isPhecda, plainToClass, registerAsync, to } from '../src/index'
describe('validate&transform', () => {
  class Parent {
    @Ignore
    @Rule('phecda', k => `${k} should be phecda`)
    @Pipe(to((name: string) => `${name}1`)
      .to(name => `${name}1`)
      .to(name => `${name}1`))
    name: string

    @Expose
    get fullname() {
      return `${this.name}-core`
    }

    changeName() {
      this.name = 'phecda-changed'
    }
  }
  it('plainToClass', async () => {
    // false
    const { err } = await plainToClass(Parent, { name: 'phecda11' })
    expect(err.length).toBe(1)

    expect(err[0]).toBe('name should be phecda')

    const { data } = await plainToClass(Parent, { name: 'phecda' })
    expect(data.name).toBe('phecda111')
    expect(data.fullname).toBe('phecda111-core')

    data.changeName()

    expect(data.name).toBe('phecda-changed')
    expect(data.fullname).toBe('phecda-changed-core')
  })

  it('classToValue', async () => {
    const { data } = await plainToClass(Parent, { name: 'phecda' })
    expect(classToValue(data)).toMatchSnapshot()
  })

  it('extend', async () => {
    class Child extends Parent {
      @Rule((str: string) => str.length < 5, 'name should be short')
      @Ignore
      name: string
    }

    const { err, data } = await plainToClass(Child, { name: 'phecda11', age: '1' }, { transform: true, collectError: true })
    expect(err.length).toBe(2)
    expect(err[0]).toBe('name should be short')
    expect(data.name).toBe('phecda11111')
    expect(classToValue(data)).toMatchSnapshot()
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
    await registerAsync(instance)
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
    await registerAsync(instance)
    expect(instance.key).toBe(10)
    expect(instance.$_key).toBe(10)

    instance.key = 20
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveReturnedWith(20)
    expect(instance.key).toBe(20)
  })
})
