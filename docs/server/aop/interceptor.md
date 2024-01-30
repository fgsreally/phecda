### 拦截器
> 运行在守卫之后

具体参数详见类型提示
```ts
import type {ExpressCtx} from 'phecda-server/express'

addInterceptor<ExpressCtx>('test',()=>{
return ()=>{

}
// 如果返回一个函数，这个函数会在执行完接口后执行，（但如果报错了就不会执行）
// 如果返回其他不为空的值，就会直接返回请求
})

//...
@Interceptor('test')
@Get()
get(){

}

```


:::info
这些装饰器挂在方法上，就是只有这个接口使用，挂在类上，就是这个类上所有接口使用
当然也可以设置全局

```ts
bindApp(app, data, {
  globalInterceptors: ['tests'],
})
```

:::

## 模块化

> 推荐使用，这可以提供热更新、依赖注入等功能

```ts
import { PInterceptor } from 'phecda-server'
import type { ExpressCtx } from 'phecda-server/express'

@Tag('Cache')
class Cache extends PInterceptor<ExpressCtx> {
  constructor() {
    super('Cache')// 可以通过super，可以通过Tag,也可以直接通过类名，三者其一就行
  }

  use(ctx: ExpressCtx) {
    // ...
  }
}
// in main.ts

Factory([Cache])
```

