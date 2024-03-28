# phecda-core

`phecda-vue`实现了`phecda-core`的一些标准

主要是`初始化`/`错误处理`/`事件总线`/`离线存储`

由于依赖了`mitt`、且实现的比较死板

所以它只是个可选的方案，需要手动注入

```ts
import { createPhecda, defaultWebInject } from 'phecda-vue'
import App from './App.vue'

defaultWebInject()// 如果不注入，那么Storage和Watch将会失效，Init和Err仍能正常工作
const app = createApp(App).use(createPhecda())
```

案例

```ts
import { Err, Init, Storage, Watcher, emitter } from 'phecda-vue'
@Storage('home')// 存入localstorage的home
class Home {
  name: string
  @Init
  init() {
    this.name = 'home'
  }

  @Err(errorHandler)
  throw() {
    throw new Error('invoke error Handler')
  }

  @Watcher('changeName')
  watch(name: string) {
    console.log(name)// name
  }
}
emitter.emit('changeName', 'name') // 触发 changeName事件
```


