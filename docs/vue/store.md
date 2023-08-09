# 状态管理
基于面向对象，依赖注入的状态管理
举个例子
```ts
import { Init, Watcher, emitter, useO, useR, useV } from 'phecda-vue'
class HomeModel {
  name: string
  @Err(() => {})
  @Watcher('changeName')
  changeName(name: string) {
    this.name = name
  }

  @Init
  init() { // 第一次被useV/useO/useR调用时触发，较构造函数晚
    this.name = 'home'
  }
}

const { name /** ref('name') */ } = useV(HomeModel)// 被错误处理包裹
const Home /** reactive(HomeModel) */ = useR(HomeModel)// 同上
const Home /** reactive(HomeModel) */ = useO(HomeModel)// 未被错误处理包裹
emitter.emit('changeName', 'name')// 事件总线
```

