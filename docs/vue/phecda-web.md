# phecda-web

`pv` 是基于`phecda-web`，拥有`phecda-web`和`phecda-core`的所有功能

## 引入：

```ts
import { createPhecda, defaultWebInject } from 'phecda-vue'
import App from './App.vue'

const app = createApp(App).use(createPhecda())

// 支持vue devtools,这可把我累得不轻

// 如果需要初始化模块，可以 use(createPhecda([HomeModel]))

// 如果需要模块初始化完成才做下一步，可以 use(await createPhecda([HomeModel]))
```

## 使用

```ts
import { Err, Init, Storage, Watcher, emitter } from 'phecda-vue'
@Storage('home')
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
// ...
emitter.emit('changeName', 'name') // 触发 changeName事件
```


