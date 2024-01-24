import { Body, Controller, Exception, Get, Param, Post, Query, Plugin, To, Guard, Interceptor, Pipe } from "../../src";



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
  @Get('/get')
  get() {
    return { msg: 'test' }
  }


  @Post('/post/:test')
  post(@Param('test') test: string, @Body('name') name: string, @Query('id') id: string) {
    return `${test}-${name}-${id}`
  }

  @Get('/error')
  error() {
    throw new Exception('test error', 500)
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

  @Guard('g1')
  @Interceptor('i1')
  @Interceptor('i2')
  @Post('/aop/:test')
  aop(@Param('test') test: string) {
    return `${test}`
  }
}