import { log } from '../utils' with { ps: 'not-hmr'}
import { TestService } from './test.service'
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
    setTimeout(async () => {
      const { log } = await import('../utils', {
        // with: {
        //   ps: 'not-hmr',
        // },
      })
      log('start!')
    }, 1000)
    // throw new Error('test')
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

  customResponse() {
    return new CustomResponse()
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
