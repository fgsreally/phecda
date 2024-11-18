# 守卫

> 在以前的版本中，是有和`nestjs`一样的守卫和拦截器的，但个人认为不好用, so...

类似于中间件


```ts
import { Controller, Guard, PGuard } from 'phecda-server'
import type { ExpressCtx } from 'phecda-server/express'

@Tag('Auth')
class Auth extends PGuard<ExpressCtx> {
  constructor() {
    super('Auth') // 可以通过super，可以通过Tag,也可以直接通过类名，三者其一就行
  }

  priority = 0// 越大越优先

  use(ctx: ExpressCtx, next: NextFunction) {

    const ret = await next()

    return ret // 可以改写返回值，可以为空，可以不调用next（后两者不会修改响应逻辑）
    // ...
  }
}

@Controller()
class TestController {
  @Guard('Auth') // 使用auth guard
  @Get()
  get() {}
}
Factory([Auth, TestController])
```

## 全局守卫
```ts
bind(app, data, {
  globalGuards: ['Auth'],
})
```

