import { describe, expect, it } from 'vitest'
import { toReq } from '../src/helper'

describe('client ', () => {
  it('handle request data', () => {
    const data = {
      query: {
        id: '1',
        name: 'phecda',
      },
      params: {
        test: 'phecda',
        loc: 'loc',
      },
      headers: {},
      body: {
        name: 'server',
      },
      name: 'A-test',
      method: 'post' as const,
      url: '/base',
      tag: 'A-test',
      args: [],
    }
    expect(toReq(data)).toMatchSnapshot()
  })
})
