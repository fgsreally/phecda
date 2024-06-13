# 自定义功能

> 具体代码可见[phecda-server-ws](https://github.com/fgsreally/phecda-ws)

假设需要自定义`websocket`功能，那么需要：
1. **控制器**
2. **适配器**
3. **代码生成器**
4. **请求适配器**

## 控制器

`Controller`是作为`http`的控制器，`Rpc`是作为微服务的控制器，那么假设要支持`websocket`，也需要一个专门的控制器
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

## bind

控制器完成后，还需要将`ps`的模块接入`ws`,需要一个`bind`函数

具体实现看源码

## 配置文件
需要更改[配置文件](./command.md#phecda-init)的`resolve`，使重定向

```json
{
  "source": "wss",
  "importer": "ws",
  "path": ".ps/ws.js"
}
```

## 请求适配器

```ts
import { createClient } from 'phecda-client-ws'

const ws = new WebSocket('ws://localhost:3001')
const client = createClient(ws, {
  test: TestWs,
}, {
  test(data) {
    console.log(data)
  },
})

ws.onopen = () => {
  console.log('open!')
  client.test.add({ name: 'ws' })
}
```