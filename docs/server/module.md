# 模块

在`PS`中，通过依赖注入串联的类，都是模块，（我们先暂时这么称呼）

`controller/service/rpc/module`都是模块

不难发现，`PS`项目中会有两种模块
一种是`Phecda`标准的类，它有两个特征：

1. 被`phecda`的装饰器修饰
2. 构造函数中的所有参数，都是注入的依赖

第二种类就是其他任意类（但第二种类只能成为边缘模块，也就是它不能使用其他模块的能力，构造函数不能注入值）

```ts
import { Controller } from "phecda-server";
//第二类模块
class xx {
  constructor() //不能注入值
  {}
}
//第一类模块
@Controller("/") //被装饰
export class Test {
  constructor(
    protected xx: xx //注入的依赖
  ) {}
}
```

:::tip 提醒
注意，`Phecda`模块的构造函数参数一定是注入的依赖，不要写入其他东西
:::

## 模块化

有时候需要封装一些功能，那么最好将其封装为第一类模块

> 这有点类似于`nestjs`的模块，让`mongoose`->`nestjs-mongoose`，这会使模块更好用

```ts
@Tag("xx")
class XxModule {}
```

还有一种常见的情况是：第三方提供的是一个类

此时可以简单的继承

```ts
@Tag("xx")
class XxModule extends xx {
  constructor() {
    super(...args);
  }
}
```

那么原本的类`xx`的参数应该怎么取呢（即`args`）

有两种办法：

1. 业务中，可以封装一个`ConfigModule`

```ts
@Tag("xx")
class XxModule extends xx {
  constructor(protected config: ConfigModule) {
    super(config.xx);
  }
}
```

2. 如果是作为一个工具库

```ts
import { getConfig } from "phecda-server";
@Tag("xx")
class XxModule extends xx {
  constructor() {
    super(getConfig("xx"));
  }
}

//在引入XxModule之前
setConfig("xx", config);
```

## 继承多个类

有一种极其特殊的情况：需要继承多个类
假设我需要一个模块拥有两方面的能力：

1. 热更新的能力（来自第一类模块）

2. 缓存的能力（好吧，我们假设使用了`ioredis`,它会提供一个`Redis`类）（来自第二类模块）


最简单的方法当然是使用组合

```ts
import { Dev } from "phecda-server";
import { Redis } from "ioredis";
export class xx extends Dev {
  redis = new Redis();
}
```
但如果真的需要继承两个类，这会麻烦一点，`ts`确实有`mixin`的功能，但无论哪个版本都很孱弱

npm包[ts-mixer](https://github.com/tannerntannern/ts-mixer/tree/master)也有一定的问题

一个解决方法是：
```ts
import { Dev } from "phecda-server";
import { Redis } from "ioredis";
export interface xx extends Redis{

}

export class xx extends Dev {
  constructor(){
    Object.assign(this,new Redis())
  }
}
```


## 模块修改
假设有一个封装好的模块`xx`，但在我觉得其功能不太对，可以继承时简单的修改
```ts
import {xx} from 'xx'

export class newXxModule extends xx{

    newMethod(){
        //..
    }
}
//main.ts
Factory([newXxModule])

```

## 模块覆盖
有一些模块，并没有通过`Factory`直接引入，而是通过注入其他模块从而引入（间接引入），

意味着没有办法使用模块修改，那么可以模块覆盖！

假设有一个封装好的模块`xx`，它使用了另一个模块`a`（没有直接引入，是通过`xx`间接引入），我希望能用一个新的模块覆盖`a`
```ts
@Tag('a')//必须要和`a`模块的tag相同
class a{

}

//main.ts
Factory([a,xx])//a要抢在xx之前注册
```

原因是：`PS`根据`Tag`or类名 做标记来判断的，如果两个模块有一样的标记，就使用最先被实例化的，

将新的模块放到最前面，最先被实例化，xx原本是要去加载`a`模块,而已经存在了一个标记为`a`且被实例化的模块，那它们就会直接用这个

但这样自然不太安全，更好的方式是

```ts
import {a} from 'a'
class newA extends a{

}

//main.ts
Factory([newA,xx])
```