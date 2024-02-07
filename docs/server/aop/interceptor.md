### 拦截器
运行在守卫之后

具体参数详见类型提示


```ts
import { Interceptor, PInterceptor } from 'phecda-server'
import type { ExpressCtx } from 'phecda-server/express'

@Tag('Cache')
class Cache extends PInterceptor<ExpressCtx> {
  constructor() {
    super('Cache')// 可以通过super，可以通过Tag,也可以直接通过类名，三者其一就行
  }

  use(ctx: ExpressCtx) {
    // 如果返回一个函数，这个函数会在执行完接口后执行，（但如果报错了就不会执行）
    // 如果返回其他不为空的值，就会直接将改值返回
    // ...
  }
}
// in main.ts

class Test {
  @Get()
  @Interceptor('Cache')
  getCache() {

  }

}

Factory([Cache])
```

### 全局使用
```ts
bindApp(app, data, {
  globalInterceptors: ['Cache'],
})
```