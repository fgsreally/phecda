# 插件

对应的服务端框架的扩展能力，为一个函数，根据不同服务端框架，返回不同的东西

1. 在 `express` 中返回`express`中间件,
2. `koa`返回`koa`中间件，
3. `fastify` 中返回 `register` 的插件
4. `h3`返回`onRequest`，为`defineRequestMiddleware`的参数
5. `rpc`中忽略

:::danger

 这个角色显然是完全无法跨框架的

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
@Controller()
class TestController {
  @Plugin('Test')
  @Get('')
  get() {

  }
}

Factory([Test, TestController])
```

## 专用路由插件
专用路由[详见](../advance/parallel-route.md)
```ts
bind(app, data, {
  parallelPlugins: ['Test'],
})
```
> 尽量不要这么用

## 全局插件
```ts
bind(app, data, {
  globalPlugins: ['Test'],
})
```

