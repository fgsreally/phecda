# 管道

运行在守卫之后，主要用于验证参数

每个参数都会单独进入一个管道，且**只能使用一个管道**

```ts
import { Controller, Factory, PPipe, Pipe, Post, Query } from 'phecda-server'
import type { ExpressCtx } from 'phecda-server/express'
@Tag('Validate')
class Validate extends PPipe<ExpressCtx> {
  constructor() {
    super('Validate') // 可以通过super，可以通过Tag,也可以直接通过类名，三者其一就行
  }

use(param: { arg: any; option?: any; key: string; type: string; index: number; reflect: any }, ctx: Ctx): any
{      
  // ...  
 // return 转换后的数据，传给controller 
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
没有设置管道时，默认使用`default`管道

默认管道会根据元数据以及使用的装饰器进行验证

如果元数据是个`model`,那么直接使用[validate](../../core/validate.md)进行验证，

如果使用了验证类装饰器or元数据是简单数据类型，那么相当于`validate`中验证一个属性的效果（`validate`是验证类上所有属性）

> 但`Const`装饰器无效，因为这没有什么意义

除此之外，默认管道会对`params/query`进行正确的类型转换，会将其从字符串转为元数据的对应类型，如`boolean/number`

如果你不怎么欣赏这个效果，可以设置一个`default`管道，从而顶替掉内置的管道


> 将上述的`Validate`改为`default`即可