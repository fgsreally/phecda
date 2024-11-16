export class User {
  name: string

  password: string
}

@Guard('B')

class Parent extends HttpBase {
  @Get('/framework')
  @Guard('A')

  async framework() {
    const { type } = this.context
    return type
  }
}

@Controller('base')
@Guard('D')
@Define('a', {})
export class TestController extends Parent {
  static age = 12
  age = 1

  constructor(private service: TestService) {
    super()
    this.log('这看上去非常好')
  }

  @Init
  init() {
    try {
      throw new Error('wanla')
    }
    catch (e) {
      this.log(e)
    }
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
    const { type } = this.context
    return type
  }
}
// hmr works

export const x = 1
