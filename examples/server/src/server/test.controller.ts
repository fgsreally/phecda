import type { ExpressCtx } from 'phecda-server/express'

import { A } from './test.service'

export class Tester {
  id: string
  name: string

  run() {
    return this.id + this.name
  }
}

@Controller('/base')
@Tag('test')
export class TestController extends Dev {
  static age = 12
  age = 1
  context: ExpressCtx
  constructor(public fgs: A) {
    super()

    addGuard('a', () => true)
    addPlugin('aa', () => {})
  }

  @Init
  init() {
  }

  @Post('/mq1')
  async mq(@Body('') body: undefined) {
    return body
  }

  @Post('/:test')
  @Filter('test')
  async test(@Param('test') @Pipe('TestPipe') test: string, @Body('name') name: string, @Query() id: Tester) {
    return `${test}-${name}-${id.id}-4542`
  }

  @Get('/query')
  async query(@Query('id') id: any[], @Query('name') name = 10) {
    return [id, name]
  }

  @Get('/send')
  sendMsgToMQ(@Body('data') body: string): string {
    emitter.emit('watch', 1)
    return `send msg to mq ${body}`
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

  @Watcher('watch')
  watch() {
    // publish()
  }
}
// hmr works
