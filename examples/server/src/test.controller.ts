import { Body, Controller, Get, Param, Post, Query, Tag, Watcher, emitter } from 'phecda-server'

// @Tag('test')
@Controller('/base')
export class TestController {
  @Post('/:test')
  async test(@Param('test') test: number, @Body('name') name: string, @Query('id') id: string) {
    // console.log(`${test}-${name}-${id}`)
    console.log(test, name, id)
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
