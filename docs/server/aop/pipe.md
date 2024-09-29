# 管道

运行在拦截器之后，主要用于验证参数

每个参数都会单独进入一个管道，且**只能使用一个管道**

```ts
import { Controller, Factory, PPipe, Pipe, Post, Query } from 'phecda-server'
import type { ExpressCtx } from 'phecda-server/express'
@Tag('Validate')
class Validate extends PPipe<ExpressCtx> {
  constructor() {
    super('Validate') // 可以通过super，可以通过Tag,也可以直接通过类名，三者其一就行
  }

  use(ctx: ExpressCtx) {
    // ...
  }
}
// in main.ts
@Controller('/test')
class TestController {
  @Post()
  test4(@Query() @Pipe('Validate') name: number) {
    // 使用Validate 管道
  }
}
Factory([Validate, TestController])
```

## 默认管道
没有设置管道时，默认使用`default`管道,即`phecda-core`提供的验证能力

> 和`class-validator`很像

```ts
import { Body, Controller, Post, To } from 'phecda-server'

class BodyData {
  // 当请求体中的 age 为 17，就会报错，为 19 的话，body.age 就会得到 20
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


如果你不怎么欣赏这个效果，可以设置一个`default`管道，从而顶替掉内置的管道

> 将上述的`Validate`改为`default`即可