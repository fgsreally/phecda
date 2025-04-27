import { describe, expect, it } from 'vitest'
import { Body, Controller, Factory, Get, HTTPGenerator, Query, RPCGenerator } from '../src'

describe(' generater', () => {
  it('generate http request code', async () => {
    @Controller('/base')
    class A {
      @Get('/test')
      test(@Query('id') id: string, @Body('name') name: string) {
        return id + name
      }
    }
    const { meta } = await Factory([A])
    const code = new HTTPGenerator('').generateCode(meta)
    expect(code).toMatchSnapshot()
  })

  it('generate RPC request', async () => {
    @Controller('/base')
    class A {
      @Get('/test')
      test(@Body() id: string, @Body() name: string) {
        return id + name
      }
    }
    const { meta } = await Factory([A])
    const code = new RPCGenerator('').generateCode(meta)
    expect(code).toMatchSnapshot()
  })
})
