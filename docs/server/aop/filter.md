# 过滤器

负责处理处理报错，和管道一样，**只会触发一个**


```ts
import { Controller, PFilter,type BaseError } from 'phecda-server'
import type { ExpressCtx } from 'phecda-server/express'

@Tag('Log')
class Log extends PFilter<ExpressCtx> {
  constructor() {
    super('Log')// 可以通过super，可以通过Tag,也可以直接通过类名，三者其一就行
  }

  use(err: Error | Exception, ctx: ExpressCtx): BaseError {
    // ...
    // return 返回给前端的错误数据体
  }
}
// in main.ts
@Filter('Log')
@Controller()
class TestController {

}

Factory([Log, TestController])
```


## 默认过滤器
和管道一样，默认使用`default`过滤器,其效果如下

```ts
import { BadRequestException, Filter } from 'phecda-server'
@Controller('/Log')
// @Filter('default')
class TestController {
  @Post()
  test4(@Query() name: number) {
    throw new BadRequestException('error!!')//更多的错误种类可以查看源码exception文件夹，也可以自行定义
  }
}
```

收到报错信息如下

```json
{
  "message": "error!!",
  "description": "Bad Request",
  "status": 400,
  "__PS_ERROR__": true
}
```