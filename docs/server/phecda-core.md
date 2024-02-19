## phecda-core
有些功能来自`phecda-core`

```ts
import { Init, Watcher, emitter } from 'phecda-server'

class TestService {

  @Init
  _init() { // 实例化后执行，一般是异步任务，只有该模块的所有Init事件执行完了，才会执行父模块的Init
    emitter.emit('a', 10)
  }

  @Watcher('a')
  watch(arg: number) { // eventBus

  }
}
```


这里`emitter`用的是`nodejs`中的`eventEmitter`,

如果想更改,可以参考`Factory`的实现，提前`inject`

