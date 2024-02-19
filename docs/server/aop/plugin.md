# 插件

对应的服务端框架的扩展能力

1. 在 `express` 中对应`express`中间件,
2. `koa`对应`koa` 中间件，
3. `fastify` 中对应 `register` 的插件
4. `h3`对应`defineRequestMiddleware`
5. `rpc`中忽略

:::warning

 这个角色显然是完全无法跨框架的


 > nest 搞的那么复杂也只能支持`express+fastify`，这还需要一大堆其他依赖来兼容处理

:::



```ts
import { Controller, Factory, Get, PPlugin, Plugin } from 'phecda-server'
@Tag('Test')
class Test extends PPlugin {
  constructor() {
    super('Test')// 可以通过super，可以通过Tag,也可以直接通过类名，三者其一就行
  }

  use() {
    // ...
  }
}
// in main.ts
@Controller('')
class User {
  @Plugin('Test')
  @Get('')
  get() {

  }
}

Factory([Test, User])
```

## 专用路由
由于渐进的特性，全局插件是很简单的，你只需要写在外部就行（就像处理一个`express`中间件一样）

但专用路由中，是无法触发接口上的插件的！只能这样
```ts
bindApp(app, data, {
  plugins: ['Test'],
})
```

:::warning 警告

如果要使用专用路由，尽量不要使用插件

:::
