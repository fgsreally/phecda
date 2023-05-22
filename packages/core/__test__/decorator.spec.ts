import { describe, expect, it } from 'vitest'
import { getExposeKey } from '../src/core'
import { Assign, Ignore, P, Pipe, Rule, addDecoToClass, classToValue, plainToClass, registerAsync, to } from '../src/index'
describe('validate&transform', () => {
  class Parent {
    @Ignore
    @Rule('phecda', 'name should be phecda')
    @Pipe(to((name: string) => `${name}1`)
      .to(name => `${name}1`)
      .to(name => `${name}1`))
    name: string

    @P
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
      name: string
    }
    const { err, data } = await plainToClass(Child, { name: 'phecda11' }, { transform: true, collectError: true })
    expect(err.length).toBe(2)
    expect(err[1]).toBe('name should be short')
    expect(data.name).toBe('phecda11111')
    expect(classToValue(data)).toMatchSnapshot()
  })

  it('use function to add decorator', () => {
    class Any {
      name: string
    }

    addDecoToClass(Any, 'name', P)
    expect(getExposeKey(Any.prototype as any)).toMatchSnapshot()
  })
  it('test Assign', async () => {
    @Assign(() => new Promise(resolve => resolve({ key: 'test2' })))
    class Test {
      key = 'test'
    }
    const instance = new Test() as any
    await registerAsync(instance)
    expect(instance.key).toBe('test2')
  })
})
