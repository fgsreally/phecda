# 限制

由于`ps`将接口调用抽象为函数调用，其有一些局限：

### 1.只支持 json 格式的上传、返回

如果使用文件上传，需要使用`form-data`，但目前`ps`没有支持

### 2.不支持 websocket/sse

因为这不是`输入->输出` 的模式，不像一个`函数`，导致不能类型复用，

## 解决方法

简而言之，解决方法只有以下几种：

1. 不用`ps`的控制器去暴露服务，自行暴露，
2. 用`ps`控制器，但使用守卫去更改默认的逻辑
   > 以上这两种无法复用代码和类型
3. [自定义框架](../advance/custom.md)

以下是一些例子

## 不用`ps`的控制器

比如使用`ws`：

```ts
// ws.module.ts
import { WebSocketServer } from 'ws'
import { Injectable } from 'phecda-server'

@Injectable() // 是一个ps的模块
class WS extends WebSocketServer {
  constructor() {
    super({ port: 8080 })
    this.on('connection', (ws) => {
      ws.on('error', console.error)

      ws.on('message', (data) => {
        console.log('received: %s', data)
      })

      ws.send('something')
    })
  }
}
```

然后前端使用原生的方式

```ts
const ws = new Websocket('localhost:8080')
```
这里使用模块直接暴露，而没有通过控制器并和对应服务端框架结合


## 更改默认逻辑

比如`oss`中，会返回一个流
```ts
import { Stream } from 'stream'
import { CustomResponse, PInterceptor } from 'phecda-server'
import type { ExpressCtx } from 'phecda-server/express'
export class StreamInterceptor extends PInterceptor<ExpressCtx> {
  constructor() {
    super('stream')
  }

  use(ctx: ExpressCtx) {
    return (ret: any) => {
      if (ret instanceof StreamResponse) {
        ret.stream.pipe(ctx.response)
        return new Promise((resolve) => {
          ctx.response.on('end', resolve)
        })
      }
    }
  }
}

// 作用包括：
// 一，方便守卫识别从而执行一些特殊操作，
// 二，继承了CustomResponse的返回值的方法会在phecda-client被屏蔽（类型上的作用，防止phecda-client去调用这个接口）
export class StreamResponse extends CustomResponse<string> {
  constructor(public stream: Stream) {
    super()
  }
}

@Controller('/oss')
export class OssController {
  constructor(protected oss: OSSModule) {}

  @Get('/:bucket/:file')
  @Interceptor('stream')
  async download(@Param('bucket') bucket: string, @Param('file') file: string) {
    return new StreamResponse(await this.oss.getObject(bucket, file))
  }
}
```
这样前端就通过请求接口就可获取这个流

还有文件上传：
```ts
import multer from 'multer'
import { PExtension } from 'phecda-server'
import type { ExpressCtx } from 'phecda-server/express'

export class UploadExt extends PExtension<ExpressCtx> {
  constructor() {
    super('upload')
  }

  static config: multer.Options = { storage: multer.memoryStorage() }
  addon(req: any, res: any, next: any) {
    return multer(UploadExt.config).array('files')(req, res, next)
  }

  guard(ctx: ExpressCtx) {
    ctx.files = ctx.request.files
    return true
  }
}

@Controller('/oss')
export class OssController {
  constructor(protected oss: OSSModule) {}
  @Ctx
  context: HttpContextData

  @Post('/upload')
  @Addon('upload')
  @Guard('upload')
  async upload() {
    const { user, files } = this.context// 按理来说，文件是来自客户端，应该作为函数的参数而不是在上下文上，这里是破坏默认模式的，很无奈
    const bucketName = user._id
    if (!await this.oss.bucketExists(bucketName))
      await this.oss.makeBucket(bucketName)

    return Promise.all(files.map((file: any) => {
      const fileName = file.originalname

      const fileBuffer = file.buffer

      return this.oss.putObject(bucketName, fileName, fileBuffer)
    }))
  }
}
```
::: warning

> 均破坏了默认逻辑，不能使用`phecda-client`，没有办法复用类型，
:::