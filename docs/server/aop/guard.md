# 守卫

 运行在中间件之后，主要用于鉴权，

具体参数详见类型提示

:::info

`aop`也是模块！！它和其他模块一样需要引入

除了管道以外其他的装饰器，可以设置到类上，也可以设置到方法上

前者会对该类上的所有接口起效！

:::


```ts
import { Guard, PGuard } from 'phecda-server'
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
class User {
  @Guard('Auth') // 使用auth guard
  @Get()
  get() {}
}
Factory([Auth, User])
```

### 全局使用
```ts
bindApp(app, data, {
  globalGuards: ['Auth'],
})
```

