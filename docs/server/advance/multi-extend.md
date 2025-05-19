
## 多继承

假设我需要一个模块拥有两方面的能力：

1. 热更新的能力（前文的`ServerBase`）

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