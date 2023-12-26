# advanced
## 命名规范
 `x.controller.ts`是http接口
`x.service.ts`是给对应`Controller`的服务
`x.rpc.ts`是暴露给rpc的服务
`x.guard/interceptor/pipe/filter.ts`是aop相关的模块
`x.module.ts`供给上述所有的服务
## phecda-core
有些功能来自phecda-core

```ts
import { Init, Watcher, emitter } from 'phecda-server'

class TestService {

  @Init
  _init() { // 实例化后执行
    emitter.emit('a', 10)
  }

  @Watcher('a')
  watch(arg: number) { // 事件

  }
}
```

## 模块化守卫、拦截器、管道、过滤器
可能守卫这些角色，需要使用服务的功能，这样的话通过`addGuard`就比较麻烦,必须要拿到modulemap再...
一个更好的办法是将其也作为一个模块
```ts
class Guard {
  constructor(protected servcie: Service) {
    addGuard('test', this.use.bind(this))
  }

  use() {
    return false
  }

}
```

`PS`已经封装好了`PPipe`/`PGuard`/`PInterceptor`/`PFilter`，以便于使用

## 继承与覆盖
假设有一个`serviceA`,被其他`service`使用，我想扩展这个`serviceA`，但这些service都在npm包里，我没法子直接改，那么有一个取巧的方法


```ts
@Tag('A')
class SercieA {
// 不能直接操作
}

class ServiceAA extends ServiceA {

}

const data = await Factory([ServiceAA/** ... */])
```

或者

```ts
@Tag('A')
class ServiceB {

}

const data = await Factory([ServiceB/** ... */])
```

原因是：`PS`根据`Tag`or类名 做标记来判断的，如果两个模块有一样的标记，就使用最先被实例化的，

将新的`service`放到最前面，最先被实例化，其他service原本是要去加载`ServiceA`,但发现`ServiceA`标记为`A`，而已经存在了一个标记为`A`且被实例化的模块，那它们就会直接用这个新的`Service`,而不会再找`ServiceA`

主要用于继承，如果像第二种例子一样完全重写，可能会有风险！

