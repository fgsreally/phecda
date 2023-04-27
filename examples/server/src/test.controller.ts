import { Body, Controller, Get, Param, Post, Query, Watcher, emitter } from 'phecda-server'

@Controller('/base')
export class TestController {
  @Post('/:test')
  async test(@Param('test') test: string, @Body('name') name: string, @Query('id') id: string) {
    console.log(`${test}-${name}-${id}`)
    emitter.emit('watch', 'name')
    return `${test}-${name}-${id}`
  }

  @Get('/mq')
  @Watcher('watch')
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
