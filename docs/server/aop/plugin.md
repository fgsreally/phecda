# 插件

对应的服务端框架的扩展能力

在 express/h3 中对应express中间件,koa对应koa 中间件，fastify 中对应 register 的插件，rpc中忽略

> 这个角色显然是完全无法跨框架的,nest 搞的那么复杂也只能支持 express+fastify，这还需要一大堆其他依赖来兼容处理
> 所以使用了注入的模式，根据不同框架中注入不同插件，



```ts

addPlugin('auth',/**根据server不同，注入不同的东西 */)

//...
@Plugin('test')
@Get()
get(){

}

```



## 模块化

> 推荐使用，这可以提供热更新、依赖注入等功能

```ts
import { PPlugin } from "phecda-server";
@Tag('test')
class test extends PPlugin {
constructor(){
    super('test')//可以通过super，可以通过Tag,也可以直接通过类名，三者其一就行
}

  use() {
    //...
  }
}
// in main.ts

Factory([test])

```


