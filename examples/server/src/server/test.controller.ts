import { log } from './utils'
export class User {
  name: string

  password: string
}

@Controller('base')
@Guard('D')
@Define('a', {})
export class TestController extends HttpBase {
  age = 1

  constructor(private service: TestService) {
    super()
  }

  @Init
  init() {

    // initlize
  }

  @Post('/login')
  login(@Body() user: User) {
    this.service.login(user)
    return user.name + Math.random()
  }

  @Get('/test')
  async emitTest(@Query('data') data = 1) {
    emitter.emit('test', data)

    return true
  }

  @Get('framework')

  @Guard('E')

  @Guard('C')

  async framework() {
    log('framework')
    this.service.test()
    return this.context.type
  }
}
// hmr works

export const x = 1
