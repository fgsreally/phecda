# 微服务

提供与`http`体验一致的微服务

目前支持`rabbitmq`/`redis`/`kafka`

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



# 与服务端结合
[详见](https://github.com/fgsreally/phecda/tree/main/examples/server)