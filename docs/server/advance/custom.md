# 自定义功能

> 可以自定义各种部分，这里只是给一个例子
>
> 具体代码可见[phecda-server-ws](https://github.com/fgsreally/phecda-ws)

假设需要自定义`websocket`功能，那么需要自行处理以下部分：

1. **控制器**
2. **适配器**
3. **代码生成器**
4. **请求适配器**

并不一定要全部, 如果需要使用自定义的服务端框架or 微服务，只要写适配器，别的不需要


## 控制器

`Controller`是作为`http`的控制器，`Rpc`是作为微服务的控制器，那么假设要支持`websocket`，也需要一个专门的控制器将其暴露出来

可以这么设计

```ts
@WS()
class a {
  @On()
  add(@Arg() data: any) {
    console.log(data)
  }
}
```

## 适配器
控制器完成后，还需要将`ps`的模块接入`ws`,需要一个`bind`函数

> 如果是对原有框架的增强，那么就是`bind`，如果原有框架不太方便用加强（比如`bullmq`）,那么就是`create`

具体实现看源码


## 代码生成器
### 生成代码

```ts
const data = await Factory([TestWs], {
  generators: [new WSGenerator()],
})
```
### 配置文件

需要更改[配置文件](./command.md#phecda-init)的`resolve`，使重定向

```json
{
  "source": "wss",
  "importer": "ws",
  "path": ".ps/ws.js"
}
```

## 请求适配器

具体实现看源码

```ts
import { createClient } from 'phecda-client-ws'

const ws = new WebSocket('ws://localhost:3001')
const client = createClient(
  ws,
  {
    test: TestWs,
  },
  {
    test(data) {
      console.log(data)
    },
  }
)

ws.onopen = () => {
  console.log('open!')
  client.test.add({ name: 'ws' })
}
```

## 最终效果

### 创建控制器

```ts
// test.ws.ts
import { Arg, Ctx } from 'phecda-server'
import { On, Ws, type WsContext } from 'phecda-server-ws'

@Ws()
export class TestWs {
  @Ctx
  context: WsContext

  @On
  add(@Arg data: { name: string }) {
    this.context.broadcast('test', data)// emit test event
  }
}
```

### 启动服务，添加适配器、生成器

```ts
// main.ts
import { WSGenerator, bind } from 'phecda-server-ws'
import { Factory } from 'phecda-server'
import { WebSocketServer } from 'ws'
import { TestWs } from './test.ws'

const data = await Factory([TestWs], {
  generators: [new WSGenerator()],
})
const server = new WebSocketServer({ port: 3001 })

bind(server, data)
```

### 更改 ps.config

```json
{
  "resolve": [
    {
      "source": "ws",
      "importer": "client",
      "path": ".ps/ws.js"
    }
  ],

  "moduleFile": ["ws"]
}
```

### 使用请求适配器，进行客户端调用

```ts
import { createClient } from 'phecda-client-ws'
import { TestWs } from '../server/test.ws' // it will redirect to .ps/ws.js
const ws = new WebSocket('ws://localhost:3001')
const client = createClient(
  ws,
  {
    test: TestWs,
  },
  {
    test(data) {
      console.log(data) // server emit 'test' event
    },
  }
)

ws.onopen = () => {
  console.log('open!')
}

client.test.add({ name: 'ws' })// invoke 'add' on TestController
```
