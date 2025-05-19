# 微服务

提供与`http`体验一致的微服务

> 只能实现`一次输入-一次输出`这个模式

目前支持`rabbitmq`/`redis`/`kafka`/`nats`/`bullmq`/`websocket`/`electron`

## 创建控制器

`controller`是为`http`服务的，在这里需要的是`rpc`

创建`test.rpc.ts`

```ts
import { Arg, Event, Queue, Rpc } from 'phecda-server'

@Rpc()
export class TestRpc {
  @Queue()

  run(@Arg() /** 只是一个标识 */ arg: string) {
    console.log(`arg is ${arg}`)
    return arg
  }

  @Queue('test')// 走test这个channel
  @Event() // 标记这个是事件模式，不会返回任何值
  event(@Arg() arg: string) {
    console.log(`arg is ${arg}`)
  }
}
```


## 初始化+产生代码



```ts
const data = await Factory([UserController], {
  generators: [new RPCGenerator()]
})
```

整体流程没有不同



## 案例
[electron](https://github.com/fgsreally/phecda/tree/main/examples/electron)

[websocket](https://github.com/fgsreally/phecda/tree/main/examples/ws)

[其他rpc](https://github.com/fgsreally/phecda/tree/main/examples/rpc)