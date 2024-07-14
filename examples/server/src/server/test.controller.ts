const isString = Rule(data => typeof data === 'string', 'it should be a string')

export class User {
  @isString
  name: string

  @isString
  password: string

  getRandom() {
    return this.name + Math.random()
  }
}

@Controller('/base')
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
    return user.getRandom()
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
