# 状态管理

:::info 前提
由于`react`本身不支持响应式数据，需要引入`valtio`

:::

面向对象、符合直觉的状态管理

## 初始化

```tsx
import { PhecdaContext, createPhecda } from 'phecda-react'

function App() {
  return (
    <>
      <PhecdaContext.Provider value={createPhecda()}>
        {/* ... */}
      </PhecdaContext.Provider>
    </>
  )
}
```

## 快速开始

举个例子

```ts
import { useR } from 'phecda-react'
class HomeModel {
  name: string

  changeName(name: string) {
    this.name = name
  }
}

const [getter, setter] = useR(AboutModel)// 通过getter取值，通过setter执行方法或者直接赋值
```

::: warning

注意，在构造函数中，数据并不是响应式的

如果希望在初始化时，操作响应式数据 ，详见[Init](../base.md)
:::

## 不同环境

上述的`useR`，在不同环境下需要调整写法

```ts
const { name /** ref('name') */ } = useR(HomeModel) // 组件中
const { name /** ref('name') */ } = getR(HomeModel) // 组件外
```

在`ssr`中要麻烦一点:

```ts
const app = createPhecda()
const { name /** ref('name') */ } = useR(HomeModel, app) // 组件外
```

## 获取全部功能

`useR`是很直接的功能，但可能需要更深层的操作，那需要获取`phecda`实例

```ts
const phecda = usePhecda() // 组件内
const phecda = getPhecda() // 组件外
const phecda = getPhecda(app) // 组件外，ssr环境中
```

具体功能详见[WebPhecda](../api.md)
