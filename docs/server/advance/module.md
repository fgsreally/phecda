# 模块运用

> 其实不复杂，就是面向对象的那些伎俩

## 什么是模块

在`PS`中，通过
1. `Factory`直接引入的类
2. 构造函数间接引入的类，

都是模块，（先暂时这么称呼）其只有一个限制 --`构造函数参数必须是注入的依赖`，

你可以把模块当普通的类用，也可以将普通的类封装成模块，只要理解`class`，一切就迎刃而解了

`ps`的装饰器会往类上添加元数据，但这并不影响类本身的行为

## 封装
如何将一个类封装为模块，并作为一个`npm`包或依赖给他人使用？

由于类上构造函数参数必须为注入的其他类，显然不能写入配置

有很多解决方法，没有固定的要求，可以使用静态属性

```ts
// 封装时
@Tag('xx')
class XxModule {
  static config: xx// 配置信息

  constructor() {
    // 初始化,操作XxModule.config
  }

  @Init
  private async _init() {
    // 异步初始化,操作XxModule.config
  }
}

// 使用时
xxModule.config = 'xx'
Factory([XxModule])
```

`ps`也内置了`Provide/Inject`
```ts
@Tag('xx')
class XxModule {

  constructor() {
    const config = Inject('xx')
  }

}
// ..

Provide('xx', any)
Factory([XxModule])
```

## 内置模块
`PS`提供了一些内置的模块，主要是[Aop](../aop/guard.md) 相关

除此之外，还有一个内置模块`ServerBase`（继承自`phecda-core`的`Base`,提供了一些有用的功能，)

它会帮助你在热更新的时候，移除副作用
```ts
class Test extends ServerBase {
  constructor() {
    this.onUnmount(() => {
    // 移除副作用
    })
  }
}
```



## 继承多个类

有一种极其特殊的情况：需要继承多个类

假设我需要一个模块拥有两方面的能力：

1. 热更新的能力（上述的`ServerBase`）

2. 第三方的类（好吧，我们假设使用了`ioredis`,它会提供一个`Redis`类）

最简单的方法当然是使用组合

```ts
import { ServerBase } from 'phecda-server'
import { Redis } from 'ioredis'
export class xx extends ServerBase {
  redis = new Redis()
}
```


但如果真的需要继承两个类:

```ts
import { Mixin, ServerBase } from 'phecda-server'
import { Redis } from 'ioredis'

export class xx extends Mixin(ServerBase, Redis) {

}
```
> `Mixin`来源自[ts-mixer](https://www.npmjs.com/package/ts-mixer) 

## 模块修改
假设有一个封装好的模块`xx`，但在我觉得其功能不太对，可以继承时简单的修改
```ts
import { xx } from 'xx'

export class newXxModule extends xx {

  newMethod() {
    // ..
  }
}
// main.ts
Factory([newXxModule])
```

## 模块覆盖


间接引入的模块没有办法使用上述的模块修改

那么可以模块覆盖！

假设有一个封装好的模块`dep1`，它使用了另一个模块`dep2`（没有直接引入，是通过`dep1`间接引入），

我希望能用一个新的模块覆盖`dep2`
```ts
@Tag('dep2')// 必须要和`a`模块的相同
class OverrideModule {

}

// main.ts
Factory([OverrideModule, dep1])// 要抢在真正的a模块之前注册
```
:::info 

原因是：`PS`根据`Tag/类名` 做标记来判断的，如果两个模块有一样的标记，就使用最先被实例化的，将新的模块放到最前面，最先被实例化，`dep1`原本是要去加载`dep2`模块,而已经存在了一个标记为`dep2`且被实例化的模块，那它们就会直接用这个

:::

继承并覆盖会更安全一点
```ts
class newA extends a {

}

// main.ts
Factory([newA, xx])
```