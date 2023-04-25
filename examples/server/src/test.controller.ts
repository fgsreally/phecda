import { Body, Controller, Get, Param, Post, Query } from 'phecda-server'

@Controller('/base')
export class TestController {
  @Post('/:test')
  async test(@Param('test') test: string, @Body('name') name: string, @Query('id') id: string) {
    console.log(`${test}-${name}-${id}`)
    return `${test}-${name}-${id}`
  }

  @Get('/mq')
  async mq(@Body() body: string) {
    console.log('body11', body)
  }

  @Get('/get')
  async get() {
    return {
      data: 'test',
    }
  }
}
