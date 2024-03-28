# 状态管理
面向对象、符合直觉的状态管理

举个例子
```ts
import { Init, Watcher, emitter, useO, useR, useV } from 'phecda-vue'
class HomeModel {
  name: string

  changeName(name: string) {
    this.name = name
  }

}

const { name /** ref('name') */ } = useV(HomeModel)
const Home /** reactive(HomeModel) */ = useR(HomeModel)
const Home /** reactive(HomeModel) */ = useO(HomeModel)// 不会被错误处理包裹
const Home /** 非响应式数据 */ = useRaw(HomeModel)
```

::: warning

注意，在构造函数中，数据并不是响应式的

如果希望在初始化时，操作响应式数据 ，详见[Init](./phecda-core.md)
:::