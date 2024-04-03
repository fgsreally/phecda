import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { Factory, Injectable } from '../src/core'
import { Body, Controller, Get, Query } from '../src/decorators'
import type { Meta } from '../src/meta'
import { Ctx, Init, Tag } from '../src'

describe('Factory ', () => {
  it('Factory will create instance and collect metadata', async () => {
    @Controller('/base')
    class A {
      @Ctx
      context: any

      @Get('/test')
      test(@Query('id') id: string, @Body('name') name: string) {
        return id + name
      }
    }
    const { meta } = await Factory([A])
    const data = meta.map(item => item.data)
    expectTypeOf(meta).items.toEqualTypeOf<Meta>()
    expect(data).toMatchSnapshot()
  })

  it('In extended case', async () => {
    @Controller('/A')// It won't work
    class A {
      @Get('/testA')
      test(@Query('id') id: string, @Body('name') name: string) {
        return id + name
      }
    }

    @Controller('/B')

    class B extends A {
      @Get('/testB')
      test2(@Query('id') id: string, @Body('name') name: string) {
        return id + name
      }
    }
    const { meta } = await Factory([B])
    const data = meta.map(item => item.data)
    expect(data).toMatchSnapshot()
  })

  it('multple class extends the same class', async () => {
    @Controller('/A')// It won't work
    class A {
      @Get('/testA')
      test(@Query('id') id: string, @Body('name') name: string) {
        return id + name
      }
    }

    @Controller('/B')
    class B extends A {
      @Get('/testB')
      test2(@Query('id') id: string, @Body('name') name: string) {
        return id + name
      }
    }
    @Controller('/C')
    class C extends A {
      @Get('/testC')
      test3(@Query('id') id: string, @Body('name') name: string) {
        return id + name
      }
    }
    const { meta } = await Factory([B, C])
    const data = meta.map(item => item.data)
    expect(data).toMatchSnapshot()
  })

  it('Factory will work using nest class', async () => {
    @Tag('S')
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
    const { moduleMap } = await Factory([A, Service])
    expect(moduleMap.size).toBe(2)
    expect(moduleMap.get('A').test()).toBe('test')
  })

  it('Factory will handle init events correctly', async () => {
    const fn = vi.fn((str: string) => str)

    function wait(timeout = 1000) {
      return new Promise<void>((resolve) => {
        setTimeout(resolve, timeout)
      })
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class A {
      @Init
      async _init() {
        await wait()
        fn('a')
      }
    }

    @Injectable()
    class B {
      constructor(public A: A) {
      }

      @Init
      async _init() {
        await wait()
        fn('b')
      }
    }

    await Factory([B])
    expect(fn).toHaveBeenCalledTimes(2)
  })
})

// 'a'-'b'-'c'

// 'a'-'e'-'c'
