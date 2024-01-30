# 过滤器

负责处理处理报错
默认使用`default`过滤器,其效果如下

```ts
import { BadRequestException, Filter } from 'phecda-server'
@Controller('/test')
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
  "error": true
}
```

你可以设计自己的过滤器,从而记录错误日志 or 其他
```ts
import { addFilter } from 'phecda-server'
import type { ExpressCtx } from 'phecda-server/express'

addFilter<ExpressCtx>('test', () => {

})
```

也可以继承`Exception`，设计特定的错误信息


## 模块化

> 推荐使用，这可以提供热更新、依赖注入等功能

```ts
import { PFilter } from 'phecda-server'
import type { ExpressCtx } from 'phecda-server/express'

@Tag('test')
class test extends PFilter<ExpressCtx> {
  constructor() {
    super('test')// 可以通过super，可以通过Tag,也可以直接通过类名，三者其一就行
  }

  use(err: Error | Exception, ctx: ExpressCtx) {
    // ...
  }
}
// in main.ts

Factory([test])
```
