# 插件
> 目前只用于`http`

操作服务端框架提供的路由

:::warning

 这个角色显然是完全无法跨框架的

:::



```ts
import { Controller, Factory, Get, PAddon } from 'phecda-server'
@Tag('Test')
class Test extends PAddon {
  constructor() {
    super('Test')// 可以通过super，可以通过Tag,也可以直接通过类名，三者其一就行
  }

  use(router, framework) {
    if (framework === 'express')
      router.use(/** middleware */)

    // ...
  }
}
// in main.ts
@Controller()
class TestController {
  @Addon('Test')
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
  parallelAddons: ['Test'],
})
```
> 尽量不要这么用

## 全局插件
```ts
bind(app, data, {
  globalAddons: ['Test'],
})
```

