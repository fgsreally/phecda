# 模块

和`phecda-server`一致，也是通过`Tag/类名`去标记模块，且是唯一标记，

只会加载第一个，后续同名模块被忽略

且也是单例模式，每个`model`只会被实例化一次


## 非单例模式
这种情况比较少，比如弹窗（每次弹出时实例化一次）

可以这样

```ts
import { Isolate } from 'phecda-vue'

@Isolate
class ModalModel {

}

useV(ModalModel)// 每次都会重新创建一个实例
```

## 性能优化
情况极少，原理是使用`ShallowReactive`代替`reactive`

可以这样

```ts
import { Shallow } from 'phecda-vue'

@Shallow
class Model {

}

useV(Model)// 每次都会重新创建一个实例
```