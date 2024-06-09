### 拦截器
前置拦截器运行在守卫之后，
后置拦截器运行在方法执行之后

:::info
拦截器可以中止`ps`的逻辑，拦截器如果返回非undefined的值，会提前结束`ps`的运行逻辑，直接返回数据
:::
具体参数详见类型提示


```ts
import { Controller, Interceptor, PInterceptor } from 'phecda-server'
import type { ExpressCtx } from 'phecda-server/express'

@Tag('Cache')
class Cache extends PInterceptor<ExpressCtx> {
  constructor() {
    super('Cache')// 可以通过super，可以通过Tag,也可以直接通过类名，三者其一就行
  }

  use(ctx: ExpressCtx) {
    // 函数本身是前置拦截器
    // 如果返回一个函数，那么这个函数会作为后置拦截器
    // 前置拦截器和后置拦截器如果执行后返回非空值，会直接返回这个值，如果已经返回过数据（如express中res.end已经执行过了，那则只是中断逻辑，不会返回数据
    // ...
  }
}
// in main.ts

@Controller()
class TestController {
  @Get()
  @Interceptor('Cache')
  getCache() {

  }

}

Factory([TestController, Cache])
```

### 全局使用
```ts
bind(app, data, {
  globalInterceptors: ['Cache'],
})
```