import { describe, expect, it } from 'vitest'
import { mergeReq, toReq } from '../src/client'

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
      body: {
        name: 'server',
      },
      realParam: '/phecda/loc',
    }
    expect(toReq(data)).toMatchSnapshot()
    expect(mergeReq(data)).toMatchSnapshot()
  })
})
