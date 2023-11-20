import { Base, Body, Controller, Define, Get, Param, Post, Query, Tag, Watcher, emitter } from 'phecda-server'

import { A } from './test.service'
import { log } from './utils'
// import { publish } from './publish'

@Controller('/base')
@Tag('test')
export class TestController extends Base {
  static age = 12
  age = 1
  constructor(public fgs: A) {
    super()
  }

  @Post('/mq')
  async mq(@Body('') body: undefined) {
    console.log('use mq', body)
  }

  @Post('/:test')
  async test(@Param('test') test: string, @Body('name') name: string, @Query() id: { id: string; name: string }) {
    log(`controller-${test}-${name}`)
    this.fgs.fgs.run()
    return `${test}-${name}-${id.id}`
  }

  @Get('/query')
  async query(@Query('id') id: any[], @Query('name', Number) name = 10) {
    return id
  }

  @Get('/send')
  async sendMsgToMQ(@Body('data') body: string) {
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
