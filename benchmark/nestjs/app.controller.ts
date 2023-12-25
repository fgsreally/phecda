import { Body, Controller, Post } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/hello')
  hello(@Body() hello: string): string {
    this.appService.getHello()
    return hello
  }
}
