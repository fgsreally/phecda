# 规范
## 模块名规范 
`ps`中模块（类）有以下几种，
1. **控制器**，负责把服务暴露给外部，

在`express`中对应着`controller`（类名为`XXController`），负责暴露`http`接口，

在`rabbitmq`中对应着`rpc`（类名为`XXRpc`），负责暴露队列

2. **服务模块**，主要是被控制器调用，对应着`service`（类名为`XXService`）
3. **基础模块**，主要是提供一些基础能力给其他模块使用，对应着`module`（类名为`XXModule`）
4. **`aop`模块**， 提供`aop`功能（类名为`XXPipe/XXGuard/XXFilter/XXPlugin/XXInterceptor`）
5. **边缘模块**，不被其他模块调用的模块，主要用于定时器、事件总线（类名为`XXEdge`）

创建模块时，只需要`1/4/5`
如 
```ts
const data = await Factory([XXController, XXGuard, XXEdge])
```

## 文件规范 
### 模块文件
一个文件一个模块（类），务必遵守，否则可能导致`ps`运行时出问题
> 这是内置的规范，如果要调整，可以更改`ps.json`

1. `*.controller.ts` <--> `XXController`
2. `*.service.ts` <--> `XXService`
3. `*.rpc.ts` <--> `XXRpc`
4. `*.guard/interceptor/pipe/filter/extension/plugin.ts` <--> `XXPipe/XXGuard/XXFilter/XXPlugin/XXInterceptor/XXExtension`
5. `*.module.ts` <--> `XXModule`
6. `*.edge.ts` <--> `XXEdge`


### 调用方文件
一般情况是客户端和服务端两个程序在不同的地方，如果在一个项目下，比如两个都是`express`项目，其中一个想通过`http`调用另外一个

经前文可知要使用`phecda-client`，

```ts
import axios from 'axios'
import { createChainReq } from 'phecda-client'
import { UserController } from '../server/user.controller'
// 指向controller的路径！这里只是用它的类型，运行时并没有引入Controller，
const instance = axios.create({
  baseURL: 'http://localhost:3699',
})
const request = createChainReq(instance, { user: UserController },)
```
很显然，运行时并不知道此时要引入的只是`UserController`的类型，真实引入的其实不是这个，如果是前后端分离，像前文，可以通过`vite`插件处理，

此时需要将文件名改为 `*.http.ts` ，运行时会自动编译进行对应处理


7. `*.http.ts` 调用`http`
8. `*.client.ts`调用微服务

