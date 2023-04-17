import { describe, expect, expectTypeOf, it } from 'vitest'
import { Factory } from '../src/core'
import { Body, Controller, Get, Query } from '../src/decorators'
import type { Meta } from '../src/meta'
describe('Factory ', () => {
  it('Factory will create instance and collect metadata', () => {
    @Controller('/base')
    class A {
      @Get('/test')
      test(@Query('id') id: string, @Body('name') name: string) {
        return id + name
      }
    }
    const { meta } = Factory([A])
    expectTypeOf(meta).items.toEqualTypeOf<Meta>()
    expect(meta).toMatchSnapshot()
  })

  it('Factory will work using nest class', () => {
    class Service {
      test() {
        return 'test'
      }
    }

    @Controller('/base')
    class A {
      constructor(public service: Service) {

      }

      @Get('/test')
      test() {
        return this.service.test()
      }
    }
    // const {meta} = Factory([A])

    expect(Factory([A]).moduleMap.size).toBe(2)
    expect(Factory([A]).moduleMap.get('A').test()).toBe('test')
  })
})
