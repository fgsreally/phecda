# 合并请求
> 把接口调用抽象成函数调用，那么函数当然可以同时调用多个，但这样会发出多次请求，这完全可以合并成一次请求
>
> 只针对于`server`框架，`rpc`没有


`phecda-server`会开放一条路由，用于合并请求,和`trpc`类似

这个功能存在[局限](./limit.md#只支持-json-格式的上传返回)

主要目的也并非出于性能，而是在很多服务端框架不提供注销路由的方法前提下，保证热更新功能的相对完整



## 服务方
默认的并行路由是`/__PHECDA_SERVER__`，可以手动设置
```ts
bind(app, data, {
  parallelRoute
})
```
如果设置`false`，就禁用

## 调用方

```ts
const chain = createChainReq(
  instance,
  { test: UserController },
  { batch: true }
)
```

