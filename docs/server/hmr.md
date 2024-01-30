# 命令行工具热更新
热更新应该是`ps`独一无二的功能，好像没有同类

简而言之，等同于`vite`的浏览器热更新

> 因为`vite`的ssr不支持热更新api，只能自己来
> nodejs版本要支持`--import`

这意味着，开发时不用再重启进程，不需要重复连接数据库，
> 也不一定，当变化延申到根文件or 抛出错误，还是要重启进程

加上`swc`，冷启动、热更新的性能真的是极限中的极限了


## 开始
安装依赖：

```shell
npm i @swc-node/core

```

使用命令行工具运行程序
```shell
npx phecda server.ts
```




## 清除副作用
如果需要在热更新的时候清除一些影响，比如取消事件，可以这样
```ts
import { Dev } from 'phecda-server'

class D extends Dev {
  constructor() {
    super()
    this.onUnmount(() => {
      // 卸载时执行
    })
  }
}
```


## 命令行

输入`e`退出开发
输入`r`重启进程
