export class User {
  name: string

  password: string
}

@Controller('/base')
@Define('a', {})
export class TestController extends HttpBase {
  static age = 12
  age = 1

  constructor(private service: TestService) {
    super()
  }

  @Init
  init() {
    // initlize
  }

  @Post('/login')
  // @Filter()
  // @Interceptor()
  // @Guard()
  // @Pipe()
  // @Plugin()
  login(@Body() user: User) {
    this.service.login(user)
    return user.name + Math.random()
  }

  @Get('/test')
  async emitTest(@Query('data') data = 1) {
    emitter.emit('test', data)

    return true
  }

  @Get('/framework')
  async framework() {
    const { type } = this.context
    return type
  }
}
// hmr works

export const x = 1
