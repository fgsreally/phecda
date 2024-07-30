# 状态管理

面向对象、符合直觉的状态管理

## 初始化

```ts
import { createPhecda, defaultWebInject } from 'phecda-vue'
import App from './App.vue'

const app = createApp(App).use(createPhecda())

// 支持vue devtools,这可把我累得不轻

// 如果需要初始化模块，可以 use(createPhecda([HomeModel]))

// 如果需要模块初始化完成才做下一步，可以 use(await createPhecda([HomeModel]))
```

## 快速开始

举个例子

```ts
import { Init, Watcher, emitter, useR, useV } from 'phecda-vue'
class HomeModel {
  name: string

  changeName(name: string) {
    this.name = name
  }
}

const { name /** ref('name') */ } = useV(HomeModel)
const Home /** reactive(HomeModel) */ = useR(HomeModel)
const Home /** 非响应式数据 */ = useRaw(HomeModel)
```

::: warning

注意，在构造函数中，数据并不是响应式的

如果希望在初始化时，操作响应式数据 ，详见[Init](../base.md)
:::

## 不同环境

上述的`useV/useR`，在不同环境下需要调整写法

```ts
const { name /** ref('name') */ } = useV(HomeModel) // 组件中
const { name /** ref('name') */ } = getV(HomeModel) // 组件外
```

在`ssr`中要麻烦一点:

```ts
const app = createPhecda()
const { name /** ref('name') */ } = getV(HomeModel, app) // 组件外
```

## 获取全部功能
`useR/useV`是很直接的功能，但可能需要更深层的操作，那需要获取`phecda`实例

```ts
const phecda = usePhecda()// 组件内
const phecda = getPhecda()// 组件外
const phecda = getPhecda(app)// 组件外，ssr环境中
```
具体功能详见[WebPhecda](../api.md)


## 性能优化
情况极少，原理是使用`ShallowReactive`代替`reactive`

可以这样

```ts
import { Shallow } from 'phecda-vue'

@Shallow
class Model {

}

useR(Model)// ShallowReactive
```