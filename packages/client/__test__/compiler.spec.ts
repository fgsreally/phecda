import { describe, expect, it } from 'vitest'
import type { P } from 'phecda-server'
import { Compiler } from '../src'
describe('fakeController', () => {
  it('compiler will create fake class', () => {
    const meta: P.Meta[] = [
      {
        name: 'Controller1',
        method: 'add',
        tag: '1',
        route: {
          route: '/a',
          type: 'post' as const,
        },
        header: {},
        guards: [],
        interceptors: [],
        middlewares: [],
        params: [{
          type: 'query',
          key: 'a',
          index: 0,
        }, {
          type: 'body',
          key: 'b',
          index: 1,
        }, {
          type: 'params',
          key: 'c',
          index: 2,
        }, {
          type: 'params',
          key: 'd',
          index: 3,
        }],
      },
      {
        name: 'Controller2',
        method: 'add',
        tag: '2',
        header: {},
        guards: [],
        interceptors: [],
        middlewares: [],
        route: {
          route: '/a',
          type: 'post' as const,
        },
        params: [{
          type: 'query',
          key: 'a',
          index: 0,
        }, {
          type: 'body',
          key: 'b',
          index: 1,
        }],
      },
    ]
    const faker = new Compiler()

    for (const i of meta)
      faker.addMethod(i)

    expect(faker.getContent()).toMatchSnapshot()
  })

  it('when key doesn\' exist', () => {
    const meta: P.Meta[] = [
      {
        name: 'Controller1',
        method: 'add',
        tag: '1',
        route: {
          route: '/a',
          type: 'post' as const,
        },
        header: {},
        guards: [],
        interceptors: [],
        middlewares: [],
        params: [{
          type: 'query',
          key: 'a',
          index: 0,
        }, {
          type: 'body',
          key: '',
          index: 1,
        }, {
          type: 'params',
          key: 'c',
          index: 2,
        }, {
          type: 'params',
          key: 'd',
          index: 3,
        }],
      },

    ]
    const faker = new Compiler()

    for (const i of meta)
      faker.addMethod(i)

    expect(faker.getContent()).toMatchSnapshot()
  })
})
