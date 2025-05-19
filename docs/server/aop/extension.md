# Extension

> 优先使用

如果需要一个模块，又提供守卫，又提供管道...提供多个`aop`的功能

那么可以

```ts
import { Addon, Filter, Guard, PExtension, Pipe } from 'phecda-server'
import type { ExpressCtx } from 'phecda-server/express'

@Tag('test')
class test extends PExtension<ExpressCtx> {
  constructor() {
    super('test') // 可以通过super，可以通过Tag,也可以直接通过类名，三者其一就行
  }

  pipe(ctx: ExpressCtx) {}

  guard(ctx: ExpressCtx) {}

  addon(...args: any) {}

  filter(error: Error | Exception, ctx: ExpressCtx) {}
}
// in main.ts

@Guard('test')
@Filter('test')
@Addon('test')
class TestController {

}

Factory([test, TestController])
```
