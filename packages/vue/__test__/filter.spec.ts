import { describe, expect, it } from 'vitest'
import { createFilter } from '../src/index'
describe('createFilter', () => {
  it('basic', async () => {
    const schema = {
      category: {
        value: '{{age}}+3',
      },
    }
    // false
    const { filter } = createFilter({ age: 40 })
    const ret = filter(schema)
    expect(ret.category.value).toBe(43)
    // setter won't work
    ret.category.value = 20

    expect(ret.category.value).toBe(43)
  })

  it('setter', async () => {
    const schema = {
      category: {
        value: '{{age}}',
      },

    }
    // false
    const { filter, data } = createFilter()
    data.value.age = 40
    const ret = filter(schema)
    expect(ret.category.value).toBe(40)
    ret.category.value = 50
    expect(data.value.age).toBe(50)
  })

  it('error handler should work', async () => {
    const schema = {
      category: {
        value: '{{if(age>30)throw new Error(\'age error\')}}',
      },
    }
    // false
    const { filter, data } = createFilter({},
      {
        errorHandler: () => {
          return 'ok'
        },
        needReturn: true,
      })
    data.value.age = 40
    expect(filter(schema).category.value).toBe('ok')
  })

  it('error handler should get errorPath', async () => {
    const schema = {
      category: {
        sub: {
          value: '{{if(age>30)throw new Error(\'age error\')}}',
        },
      },
    }
    const { filter, data } = createFilter({}, {
      errorHandler: (_error, errorPath) => {
        expect(errorPath).toBe('category.sub.value')
        return 'ok'
      },
      needReturn: true,

    })
    data.value.age = 40
    expect(filter(schema).category.sub.value).toBe('ok')
  })
})
