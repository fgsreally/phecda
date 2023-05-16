import { Body, Controller, Get, Param, Post, Query, Tag, Watcher, emitter } from 'phecda-server'

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { A } from './test.service'

@Controller('/base')
@Tag('test')
export class TestController {
  constructor(public fgs: A) {

  }

  @Post('/:test')
  async test(@Param('test') test: string, @Body('name') name: string, @Query('id') id: string) {
    // console.log(`${test}-${name}-${id}`)
    console.log(this.fgs.fgs.run())
    emitter.emit('watch', 1)

    return `${test}-${name}-${id}`
  }

  @Get('/mq')
  @Watcher('watch', { once: true })
  async mq(@Body() body: string) {
    console.log('body', body)
  }

  @Get('/get')
  async get() {
    return {
      data: 'test',
    }
  }
}
// hmr works
