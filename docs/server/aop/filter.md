# 过滤器

负责处理处理报错，和管道一样，只会触发一个


```ts
import { Controller, PFilter } from 'phecda-server'
import type { ExpressCtx } from 'phecda-server/express'

@Tag('Log')
class Log extends PFilter<ExpressCtx> {
  constructor() {
    super('Log')// 可以通过super，可以通过Tag,也可以直接通过类名，三者其一就行
  }

  // eslint-disable-next-line n/handle-callback-err
  use(err: Error | Exception, ctx: ExpressCtx) {
    // ...
  }
}
// in main.ts
@Filter('Log')
@Controller()
class TestController {

}

Factory([Log, TestController])
```


## 默认
和管道一样，默认使用`default`过滤器,其效果如下

```ts
import { BadRequestException, Filter } from 'phecda-server'
@Controller('/Log')
// @Filter('default')
class TestController {
  @Post()
  test4(@Query() name: number) {
    throw new BadRequestException('error!!')
  }
}
```

收到报错信息如下

```json
{
  "message": "error!!",
  "description": "Bad Request",
  "status": 400,
  "PS_ERROR": true
}
```