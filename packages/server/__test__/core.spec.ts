import { describe, expect, expectTypeOf, it } from 'vitest'
import { Factory } from '../src/core'
import { Body, Controller, Get, Query } from '../src/decorators'
import type { Pmeta } from '../src/meta'
describe('Factory ', () => {
  it('Factory will create instance and collect metadata', async () => {
    @Controller('/base')
    class A {
      @Get('/test')
      test(@Query('id') id: string, @Body('name') name: string) {
        return id + name
      }
    }
    const { meta } = await Factory([A])
    const data = meta.map(item => item.data)
    expectTypeOf(meta).items.toEqualTypeOf<Pmeta>()
    expect(data).toMatchSnapshot()
  })

  it('Factory will work using nest class', async () => {
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
    const { moduleMap } = await Factory([A])
    expect(moduleMap.size).toBe(2)
    expect(moduleMap.get('A').test()).toBe('test')
  })
})
