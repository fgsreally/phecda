import { BadRequestException, Body, Controller, Define, Expose, Get, Head, Nested, Param, Pipe, Plugin, Post, Put, Query, Tag, Watcher, addPipe, emitter } from 'phecda-server'
import type { ExpressCtx } from 'phecda-server/express'

import { A } from './test.service'

addPipe('test', () => {
  throw new BadRequestException('111')
})

@Controller('/base')
@Tag('test')
export class TestController {
  static age = 12
  age = 1
  context: ExpressCtx
  constructor(public fgs: A) {

  }

  @Post('/mq')
  async mq(@Body('') body: undefined) {
    console.log('use mq', body)
  }

  @Plugin('test')
  @Post('/:test')
  async test(@Param('test') @Pipe('test') test: string, @Body('name') name: string, @Query() id: { id: string; name: string }) {
    // if (test)
    //   throw new Erro r('11')

    // this.fgs.fgs.run()
    return `${test}-${name}-${id.id}-4542`
  }

  @Get('/query')
  async query(@Query('id') id: any[], @Query('name', Number) name = 10) {
    return id
  }

  @Get('/send')
  sendMsgToMQ(@Body('data') body: string): string {
    emitter.emit('watch', 1)
    return 'send msg to mq'
  }

  @Define('user', 'A')
  @Get('/get')
  async get() {
    return {
      data: Date.now(),
    }
  }

  @Get('/params')
  async params(@Query() query: any) {
    return query
  }

  @Watcher('watch', { once: true })
  watch() {
    // publish()
  }
}
// hmr works
