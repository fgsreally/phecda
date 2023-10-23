import { Base, Body, Controller, Define, Get, Param, Post, Query, Tag, Watcher, emitter } from 'phecda-server'

import { A } from './test.service'
// import { publish } from './publish'

class t {
  constructor(public fgs: string) {}
}

type C<t> = t | any

class b {
  name: string
}

@Controller('/base')
@Tag('test')
export class TestController extends Base {
  constructor(public fgs: A) {
    super()
  }

  @Post('/mq')
  async mq(@Body('') body: undefined) {
    console.log('use mq', body)
  }

  @Post('/:test')
  async test(@Param('test') test: string, @Body('name') name: string, @Query() id: { id: string; name: string }) {
    console.log(id, 'test')
    return `${test}-${name}-${id.id}`
  }

  @Get('/query')
  async query(@Query('id') id: t[]) {
    console.log('query', typeof id, id)
    return id
  }

  @Get('/send')
  async sendMsgToMQ(@Body('data') body: string) {
    emitter.emit('watch', 1)
    console.log('use mq', body)
    return 'send msg to mq'
  }

  @Define('user', 'A')
  @Get('/get')
  async get() {
    return {
      data: 'test'+Date.now(),
    }
  }

  @Watcher('watch', { once: true })
  watch() {
    // publish()
  }
}
// hmr works
