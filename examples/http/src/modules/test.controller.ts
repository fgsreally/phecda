// import { log } from '../utils' with { ps: 'not-hmr'}//禁用热更新
import { TestService } from './test.service'

export class User {
  @Required
  name: string

  @Required
  password: string
}

@Controller('base')
@Guard('D')
@Define('a', {})
export class TestController extends HttpBase {
  constructor(private service: TestService) {
    super()
  }

  @Init
  init() {
    // initlize

  }

  @Get()
  async query(@Query('query1') query1: string, @Query('query2') @Optional query2?: number) {
    return { query1, query2 }
  }

  @Get('/param/:param')
  async param(@Param('param') param: string) {
    return { param }
  }

  @Post('/login')
  login(@Body() user: User) {
    this.service.login(user)
    return 'login success!'
  }

  @Post('emitTest')
  emitTest() {
    emitter.emit('test', 1)
    return true
  }

  @Get('framework')
  async framework() {
    return this.context.type as string
  }

  // will be ignored
  customResponse() {
    return new CustomResponse()
  }

  @Get('validate/:id')
  @Doc('这是一个测试validate装饰器的接口')
  @Rule(() => true)
  validate(
    @Param('id')
    @Required @Rule(({ value }) => value > 10)
    @Doc('这是一个测试的id参数')
    id: number,
  ) {
    return id
  }

  // @Post('upload/:id')
  // @Guard('file')
  // async uploadFile(@Param('id') id: string, @OneFile() file: File) {
  //   const uploadDir = resolve(process.cwd(), 'uploads')

  //   // 确保上传目录存在
  //   try {
  //     await fs.access(uploadDir)
  //   }
  //   catch {
  //     await fs.mkdir(uploadDir, { recursive: true })
  //   }

  //   // 写入文件
  //   const filePath = resolve(uploadDir, file.name)
  //   await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()))

  //   return { id, path: filePath }
  // }

  // @Post('uploadFiles/:id')
  // @Guard('files')
  // async uploadFiles(@Param('id') id: string, @ManyFiles() files: File[]) {
  //   const uploadDir = resolve(process.cwd(), 'uploads')

  //   // 确保上传目录存在
  //   try {
  //     await fs.access(uploadDir)
  //   }
  //   catch {
  //     await fs.mkdir(uploadDir, { recursive: true })
  //   }

  //   // 写入文件

  //   files.forEach(async (file) => {
  //     const filePath = resolve(uploadDir, file.name)
  //     await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()))
  //   })

  //   return { id }
  // }
}
// hmr works
