import { expect } from 'vitest'
import { Addon, Body, Controller, Ctx, Exception, Filter, Get, Guard, HttpCtx, Param, Pipe, Post, Query, addPipe } from '../../src'
class Info {
  name: string
}

addPipe('default', ({ arg, reflect }) => {
  if (reflect === Info) {
    if (arg.name !== 'phecda')
      throw new Error('name should be phecda')
  }
  return arg
})

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
}
