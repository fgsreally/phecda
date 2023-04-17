import { Body, Controller, Get, Param, Post, Query } from 'phecda-server'

@Controller('/base')
export class TestController {
  @Post('/:test')
  async test(@Param('test') test: string, @Body('name') name: string, @Query('id') id: string) {
    return `${test}-${name}-${id}`
  }

  @Get('/get')
  async get() {
    return {
      data: 'test',
    }
  }
}
