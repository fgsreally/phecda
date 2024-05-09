# 快速开始



## 服务端
### 安装依赖
```shell
npm i phecda-server @swc-node/core
```
> 不需要热更新可以不安装后者
> 
> 但请务必安装，`<0.1s`的热更新绝对能颠覆一切考量，[详见](./hmr.md)


### 代码

以`express`为例,创建一个`user.controller.ts`和`user.service.ts`。
> 其他框架[详见](./base.md)
> 
> 和`nestjs`几乎一致


```ts
// in user.service.ts
import { Injectable } from 'phecda-server'

@Injectable()
class UserService {
  login() {
    return 'user1'
  }
}
```
```ts
import { Body, Controller, Post, Query } from 'phecda-server'
import { UserService, } from './user.service'
// in user.controller.ts
@Controller('/user')
class UserController {
  constructor(private userService: UserService) {

  }

  @Post('/login')
  login(@Body('username') name: string, @Query('version') version: string) { // 即`/login?version=xx` 请求体为{username:'xx'}
    return this.userService.login()
  }
}
```

入口程序如下
```ts
import { Factory } from 'phecda-server'
import { bind } from 'phecda-server/express'
import express from 'express'
import { UserController } from './user.controller'

const data = await Factory([UserController], {
  http: 'pmeta.js'// 输出的http代码的位置
})
const app = express()
const router = express.Router()

app.use(express.json())
bind(router, data)// 这里相当于给了app绑定了一堆express中间件
app.use(router)
app.listen(3000)
```

### 启动
```shell
npx phecda index.ts
```


## 客户端
### 安装依赖
```shell
npm i phecda-client 
```
>  如果使用的不是`axios`,那就要自己写一个类似`phecda-client`的东西

### 编译时
> 使用了 `unplugin`，`webpack`等也能用

以`vite`为例
```ts
import PC from 'phecda-client/vite'

export default defineConfig({
  plugins: [PC({ http: './pmeta.js'/** 生成的http代码的路径 */, })],
})
```

### 运行时
运行时的部分：
```ts
import axios from 'axios'
import { UserController } from '../server/user.controller'
// 指向controller的路径！这里只是用它的类型，运行时并没有引入Controller，
const instance = axios.create({
  baseURL: 'http://localhost:3699',
})
const request = createChainReq(instance, { user: UserController },)
const ret = await request.user.login('username', 'password')
```


<!-- :::error 提醒
鉴于`PS`的基于函数的模式，没法处理以下几种情况

1. 入参无意义：
   比如文件上传，前端上传的是`fileList`,而后端往往是操作被中间件处理后的东西，这导致函数体中根本不使用入参

2. 不符合入参+返回值的模式
   比如 `websocket/sse`等

以上情况并非不能实现，而是意义很小

::: -->