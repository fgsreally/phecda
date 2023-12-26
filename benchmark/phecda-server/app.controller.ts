import { Body, Controller, Post } from 'phecda-server'
import { AppService } from './app.service'

@Controller('')
export class AppController {
  context: any
  constructor(private readonly appService: AppService) {}

  @Post('/hello')
  getHello(@Body() body: string): string {
    this.appService.getHello()
    return body
  }
}
