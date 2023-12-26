# 热更新
独一无二的功能，好像没有同类

简而言之，等同于`vite`的浏览器热更新

> 因为`vite`的ssr不支持热更新api，只能自己来


这意味着，开发时不用再重启进程，不需要重复连接数据库，加上`swc`，开发启动、更新的性能真的是极限中的极限了

安装依赖：

```shell
npm i @swc-node/core

```

使用命令行工具运行程序
```shell
phecda server.ts
```

## 清除副作用
如果需要在热更新的时候清除一些影响，比如取消事件，可以这样
```ts
import { Dev } from 'phecda-server'

class D extends Dev {
  event() {
    this.onUnmount(() => {
      // 卸载时执行
    })
  }
}
```

