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

    const ret = await next()//将后续中间件处理后的值
    //return 该中间件处理后的值，让前面的中间件处理
    //和express中间件一样，一个接一个执行，如果你没有手动next，那么会在执行完后自动next
    // 但如果在next之前返回了不为undefined的值，那么后面的守卫就不会执行了，直接返回给前端
   
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
:::tip

如果`Guard`放在方法上，就只对该接口起效

如果放在类上，就是对该类的所有接口都起效，后续的`aop`模块同理
:::
## 全局守卫
```ts
bind(app, data, {
  globalGuards: ['Auth'],
})
```

