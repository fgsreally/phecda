# 上下文
上下文是非常重要的概念，`aop`非常需要它

## 基础上下文
```ts
interface BaseCtx {
  meta: ControllerMeta//元数据
  moduleMap: Record<string, any>//所有模块实例
  type: string//具体使用了什么框架
  tag: string// 对应模块的标识
  func: string//对应的方法
  category: string//http/rpc
  [key: string]: any
}

  ```

## http上下文
用于`http`
```ts
interface HttpCtx extends BaseCtx {
    parallel?: true//是否启用并行路由
  index?: number//如果启用并行路由，那么是位于第几个
  query: Record<string, any>
  params: Record<string, string>
  body: Record<string, any>
  headers: IncomingHttpHeaders
  category: 'http'
  redirect: (url: string, status?: number) => void
  getCookie(key: string): string | undefined
  setCookie(key: string, value: string, opts?: CookieSerializeOptions): void
  delCookie(key: string): void
  setResHeaders: (headers: Record<string, string>) => void
  setResStatus: (status: number) => void
  getRequest: () => IncomingMessage
  getResponse: () => ServerResponse
}
```
## rpc上下文
用于`rpc`
```ts
interface RpcCtx extends BaseCtx {
  args: any[]//由于rpc中没有query/params/body等，所以这里直接使用args代表所有过来的参数
  id: string//请求id，唯一标识
  queue: string//队列名称
  isEvent?: boolean//是否是事件，即是否需要返回值
  category: 'rpc'
}

```