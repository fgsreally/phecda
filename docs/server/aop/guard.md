# 守卫

 运行在中间件之后，主要用于鉴权，

具体参数详见类型提示

:::warning

`aop`是一些特殊的模块，会在`http`以及微服务中起效

建议使用[Extension](./extension.md)

:::


```ts
import { Controller, Guard, PGuard } from 'phecda-server'
import type { ExpressCtx } from 'phecda-server/express'

@Tag('Auth')
class Auth extends PGuard<ExpressCtx> {
  constructor() {
    super('Auth') // 可以通过super，可以通过Tag,也可以直接通过类名，三者其一就行
  }

  use(ctx: ExpressCtx) {
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

### 全局使用
```ts
bind(app, data, {
  globalGuards: ['Auth'],
})
```

