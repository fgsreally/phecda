# 守卫
> 运行在中间件之后
主要用于鉴权，

具体参数详见类型提示

```ts

addGuard('auth',()=>true)


@Guard('auth')//使用auth guard
@Get()
get(){

}

```
## 模块化

> 推荐使用，这可以提供热更新、依赖注入等功能

```ts
import { PGuard } from "phecda-server";
@Tag('auth')
class auth extends PGuard {
constructor(){
    super('auth')//可以通过super，可以通过Tag,也可以直接通过类名，三者其一就行
}

  use() {
    //...
  }
}
// in main.ts

Factory([auth])

```
