import { describe, expect, it } from 'vitest'
import { FakeController } from '../src/fake'
describe('fakeController', () => {
  it('fakeController will create fake class', () => {
    const meta = [
      {
        name: 'Controller1',
        method: 'add',
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
    const faker = new FakeController()

    for (const i of meta)
      faker.addMethod(i.name, i.method, i.route.route, i.route.type, i.params)

    expect(faker.getContent()).toMatchSnapshot()
  })
})
