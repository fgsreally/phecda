import { Body, Controller, Post } from 'phecda-server'
import { AppService } from './app.service'

@Controller('')
export class AppController {
  context: any
  constructor(private readonly appService: AppService) {}

  @Post('/hello')
  getHello(@Body() body: string): string {
    const { request: { headers } } = this.context
    this.appService.getHello()
    return body + headers['X-Custom-Header']
  }
}
