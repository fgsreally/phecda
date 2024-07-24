# 热更新
文件级别的热更新应该是`ps`独一无二的功能，好像没有同类

::: tip
这意味着，开发时不用再重启进程，不需要重复连接数据库，

加上`swc`，启动+更新的性能真的是极限中的极限了

:::

 简而言之，等同于`vite`的浏览器热更新

在我开发这个功能时，因为`vite`的`ssr`中热更新api和我预想的不同，只能自己来

不过需遵守以下：
1. `nodejs`版本要支持`--import`（>v18.18）
2. 类名/`Tag`不能更改，这是唯一标识
3. 需要处理副作用，详见[模块](./module.md#内置模块)
3. 由于绝大部分服务端框架不提供注销路由的功能，更改路由的部分可能并无效果，可以完全重启（按r+回车）或者使用[并行路由](./parallel-route.md)
 





## 开始
安装依赖：

```shell
npm i @swc-node/core

```

使用命令行工具运行程序
```shell
npx phecda server.ts
```

添加`node`参数要写在后面

```shell
npx phecda server.ts --inspect
```

> 本质就是`node --import=phecda-server/register server.js`


## 清除副作用

详见[内置模块](./module.md#内置模块)


## 命令行

输入`e`退出开发
输入`r`重启进程
