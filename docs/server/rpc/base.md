# 微服务

提供与`http`体验一致的微服务

目前支持`rabbitmq`/`redis`/`kafka`

## 快速开始

`controller`是为`http`服务的，在这里需要的是`rpc`

创建`test.rpc.ts`

::: warning

实际上你完全可以用`http`中的`Get/Post/Body/Query...`，
但为了区分，还是不要这么做
:::

```ts
import { Arg, Event, Rpc } from 'phecda-server'

@Rpc('redis', 'mq') // 允许redis、rabbitmq访问，当然也可以标在方法上
export class TestRpc {
  run(@Arg() /** 只是一个标识 */ arg: string) {
    console.log(`arg is ${arg}`)
    return arg
  }

  @Event() // 标记这个是事件模式，不会返回任何值
  event(@Arg() arg: string) {
    console.log(`arg is ${arg}`)
  }
}
```


## 服务端输出代码



```ts
const data = await Factory([UserController], {
  rpc: 'rpc.js'// 输出代码到该位置
})
```
由于和`http`一致，一样要将引入指向`rpc.js`，具体方法也是[构建工具](../client/bundler.md)和[npm](../client/npm.md)


:::danger

我假定微服务中的调用方和服务方是在两个项目里（最起码是在 monorepo 中），

不考虑同个服务的双端都在同个项目里。


:::
