# 初始化/事件总线/错误处理
这些是来自`phecda-core`的功能


```ts
import { Err, Init, Watcher, emitter } from 'phecda-server'

class Test {

  @Init
  init() { // 实例化后执行，一般是异步任务，只有该模块的所有Init事件执行完了，才会执行父模块(就是引入此模块的模块）的Init
    emitter.emit('a', 10)
  }

  @Watcher('a')
  watch(arg: number) { // eventBus

  }

  @Err(errorHandler)// 不建议
  error() {
    throw new Error('any error')// invoke errorHandler
  }
}
```


 这里`emitter`用的是`nodejs`中的`eventEmitter`, 如果想更改,可以参考`Factory`的源码实现

