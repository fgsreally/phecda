import { describe, expect, it } from 'vitest'
import { Body, Controller, Factory, Get, Query, generateHTTPCode, generateRPCCode } from '../src'

describe('compiler generate code', () => {
  it('generate http request', async () => {
    @Controller('/base')
    class A {
      @Get('/test')
      test(@Query('id') id: string, @Body('name') name: string) {
        return id + name
      }
    }
    const { meta } = await Factory([A])
    const code = generateHTTPCode(meta.map(item => item.data))

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
    const code = generateRPCCode(meta.map(item => item.data))
    expect(code).toMatchSnapshot()
  })
})
