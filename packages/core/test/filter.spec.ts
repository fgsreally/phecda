import { describe, expect, it } from 'vitest'
import { createFilter } from '../src/index'
describe('createFilter', () => {
  it('basic', async () => {
    const schema = {
      category: {
        value: '{{age>30?\'old\':\'young\'}}',
      },
    }
    // false
    const { filter, data } = createFilter()
    data.value.age = 40
    const ret = filter(schema)
    expect(ret.category.value).toBe('old')
  })
})
