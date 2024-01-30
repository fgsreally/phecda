# 管道
> 运行在拦截器之后

显然，我们需要对参数进行一些处理（主要是验证），可以为参数选择指定管道！
默认使用`default`管道,其效果如下

```ts
import { Body, Controller, Post, To } from 'phecda-server'

class BodyData {
  @To((param: any) => {
    if (age < 18)
      throw new Error('too young')
    return age + 1
  })
  age: number
}

@Controller('/test')
class TestController {
  @Post()
  test4(@Body() body: BodyDatas) {}
}
```

当请求体中的 age 为 17，就会报错，为 19 的话，body.age 就会得到 20

你也可以设置 pipe

```ts
import { Controller, Pipe, Post, Query, To, addPipe } from 'phecda-server'
import type { ExpressCtx } from 'phecda-server/express'

addPipe<ExpressCtx>('test', ({ arg, reflect }) => {
  // reflect:Number 元数据
  return reflect(arg)
  // 将query的参数类型转为 number
})

@Controller('/test')
class TestController {
  @Post()
  test4(@Query() @Pipe('test') name: number) {
    // 使用test 管道
  }
}
```

但一个参数，只能使用一个管道

## 模块化

> 推荐使用，这可以提供热更新、依赖注入等功能

```ts
import { PPipe } from 'phecda-server'
import type { ExpressCtx } from 'phecda-server/express'
@Tag('test')
class test extends PPipe<ExpressCtx> {
  constructor() {
    super('test')// 可以通过super，可以通过Tag,也可以直接通过类名，三者其一就行
  }

  use(ctx: ExpressCtx) {
    // ...
  }
}
// in main.ts

Factory([test])
```
