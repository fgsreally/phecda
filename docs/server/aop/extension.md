# Extension

> 优先使用

如果需要一个模块，又提供守卫，又提供拦截器...提供多个`aop`的功能

那么可以

```ts
import { Filter, Guard, Interceptor, PExtension, Pipe, Addon } from 'phecda-server'
import type { ExpressCtx } from 'phecda-server/express'

@Tag('test')
class test extends PExtension<ExpressCtx> {
  constructor() {
    super('test') // 可以通过super，可以通过Tag,也可以直接通过类名，三者其一就行
  }

  pipe(ctx: ExpressCtx) {}

  guard(ctx: ExpressCtx) {}

  plugin(...args: any) {}

  intercept(ctx: ExpressCtx) {}

  filter(error: Error | Exception, ctx: ExpressCtx) {}
}
// in main.ts

@Guard('test')
@Interceptor('test')
@Filter('test')
@Addon('test')
class TestController {

}

Factory([test, TestController])
```
