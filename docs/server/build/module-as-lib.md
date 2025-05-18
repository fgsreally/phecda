# 模块作为库使用

如何将一些模块作为依赖，通过`npm`发包，被其他项目使用


## 配置
作为一个依赖，首先需要考虑配置参数传入的情况

由于类上构造函数参数必须为注入的其他类，显然不能在这里写入配置

有很多解决方法，没有固定的要求，推荐使用静态属性

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


## 模块修改
假设有一个封装好的模块`User`，但在我觉得其功能不太对，可以继承时简单的修改
```ts
import { User } from 'phecda-user-module'

export class NewUserModule extends User {

  newMethod() {
    // ..
  }
}
// main.ts
Factory([NewUserModule])
```

## 模块覆盖

假设有一个封装好的用户模块`User`，它使用了数据库模块`Db`，但`Db`模块没有直接引入，而是通过`User`间接引入），

间接引入的模块没有办法使用上述的模块修改

那么可以模块覆盖！


我希望能用一个新的模块覆盖`Db`
```ts
@Tag('Db')// 必须要和`Db`模块的相同
class OverrideModule {

}

// main.ts
Factory([OverrideModule, dep1])// 要抢在真正的db模块之前注册
```
:::info 

原因是：`PS`根据`Tag/类名` 做标记来判断的，如果两个模块有一样的标记，就使用最先被实例化的，将新的模块放到最前面，最先被实例化，`User`原本是要去加载`Db`模块,而已经存在了一个标记为`Db`且被实例化的模块，那它们就会直接用这个

:::

继承并覆盖会更安全一点
```ts
class ExtendDb extends Db {

}

// main.ts
Factory([ExtendDb, User])
```