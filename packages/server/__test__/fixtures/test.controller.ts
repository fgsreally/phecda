import { expect } from 'vitest'
import { Addon, Body, Controller, Ctx, Enum, Exception, Filter, Get, Guard, HttpCtx, OneOf, Optional, Param, Pipe, Post, Query, Required } from '../../src'
class Info {
  @Required
  name: string
}

@Controller('')
export class Test {
  @Ctx
  ctx: HttpCtx

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

  @Get('/addon')
  @Addon('a1')
  addon() {
    return { msg: 'test' }
  }

  @Guard('g2')
  @Post('/guard/:test')
  guard(@Param('test') test: string) {
    return `${test}`
  }

  @Post('/all/:test')
  all(@Param('test') test: string, @Body() reqBody: any, @Query('id') id: string) {
    expect(this.ctx).toBeDefined()

    return [test, reqBody, id]
  }

  @Post('defaultPipe')
  defaultPipe(
    @Body('a') @Optional _a: string,
    @Body('b') @Optional _b: number,
    @Body('c') @Optional _c: boolean,

    @Body('d') @Optional @Enum({
      value: 'value',
    }) _d: string,

    @Body('e') @Optional @OneOf(String, Number) _e: string | number,
    @Body('f') @Optional _f: Info,
  ) {
    return true
  }
}
