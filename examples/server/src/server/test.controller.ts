import { Body, Controller, Define, Get, Head, Param, Post, Put, Query, Tag, Watcher, emitter } from 'phecda-server'
import type { ExpressCtx } from 'phecda-server/express'

import { A } from './test.service'
import { log } from './utils'

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

  @Post('/:test')
  async test(@Param('test') test: string, @Body('name') name: string, @Query() id: { id: string; name: string }) {
    console.log(test, name)
    // if (test)
    //   throw new Error('11')

    // this.fgs.fgs.run()
    return `${test}-${name}-${id.id}`
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

  @Watcher('watch', { once: true })
  watch() {
    // publish()
  }
}
// hmr works
