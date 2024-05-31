import { expect } from 'vitest'
import { Body, Controller, Ctx, Exception, Filter, Get, Guard, HttpContext, Interceptor, Param, Pipe, Plugin, Post, Query, To } from '../../src'
class Info {
  @To((p) => {
    if (p !== 'phecda')
      throw new Error('name should be phecda')
    return p
  })
  name: string
}

@Controller('')
export class Test {
  @Ctx
  ctx: HttpContext

  @Get('/get')
  get() {
    return { msg: 'test' }
  }

  @Post('/post/:test')
  post(@Param('test') test: string, @Body('name') name: string, @Query('id') id: string) {
    return `${test}-${name}-${id}`
  }

  @Get('/filter')
  @Filter('test')
  filter() {
    throw new Exception('filter error', 500)
  }

  @Get('/error')
  error(@Query('msg') msg: string) {
    throw new Exception(msg, 500)
  }

  @Post('/pipe')
  pipe(@Query('id') @Pipe('add') id: string, @Body('info') info: Info) {
    return `${id}-${info.name}`
  }

  @Get('/plugin')
  @Plugin('p1')
  plugin() {
    return { msg: 'test' }
  }

  @Guard('g2')
  @Interceptor('i2')
  @Post('/aop/:test')
  aop(@Param('test') test: string) {
    return `${test}`
  }

  @Post('/all/:test')
  all(@Param('test') test: string, @Body() reqBody: any, @Query('id') id: string) {
    expect(this.ctx).toBeDefined()

    return [test, reqBody, id]
  }
}
