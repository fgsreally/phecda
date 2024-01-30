# 客户端
首先，让服务端产生`http`的相关代码

## 服务端输出代码

```ts
const data = await Factory([UserController], {
  http: 'pmeta.js'// 输出代码到该位置
})
```


## 客户端接入代码
客户端中创建`axios`实例，使用 `phecda-client`，然后选择需要使用的接口

比如客户端此时只需要使用`TestController`的相关接口，那就引入这个`Controller`

```ts
import { TestController } from '../test.controller.ts'
```
 
 但实际上，并没有真正引入，这里只是借用其类型，

 我们需要在运行的时候，将这个路径偷换为前文的http代码路径

利用插件：
```ts
import PC from 'phecda-client/vite'

export default defineConfig({
  plugins: [PC({ localPath: './pmeta.js' })],
})
```
> 基于unplugin，webpack、vite均可行



## 客户端调用接口

调用有两种方式使用，详见examples

推荐使用链式

```ts
import { createChainReq } from 'phecda-client'

const instance = axios.create()
const $request = createChainReq(instance, { test: TestController }, { batch: true })

const data = await $request.test.test()// 成功调用接口！
```

> 这里开启`batch`就会走专用路由，[详见](./special.md)