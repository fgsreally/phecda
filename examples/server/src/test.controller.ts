import { Body, Controller, Get, Param, Post, Query, Tag, Watcher, emitter } from 'phecda-server'
import { TE } from 'TE'
// @Tag('test')
@Controller('/base')
export class TestController {
  @Post('/:test')
  async test(@Param('test') test: string, @Body('name') name: string, @Query('id') id: string) {
    console.log(`${test}-${name}-${id}`)
    emitter.emit('watch', 1)
    TE()
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
