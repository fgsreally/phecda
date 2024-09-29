# 快速开始



## 服务端
### 安装依赖
```shell
npm i phecda-server 
```
### 初始化

```shell
npx phecda init
```

这会创建配置文件`ps.json`和`tsconfig.json`(如果已存在不会覆盖)
### 代码

创建一个`user.controller.ts`和`user.service.ts`。



```ts
// user.service.ts
import { Injectable } from 'phecda-server'

@Injectable()
class UserService {
  login() {
    return 'user1'
  }
}
```
```ts
// user.controller.ts
import { Body, Controller, Post, Query } from 'phecda-server'
import { UserService } from './user.service'
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

以`express`为例,入口程序如下

> 其他框架[详见](./base.md#与服务端框架适配)

```ts{6-8,13}
import { Factory } from 'phecda-server'
import { bind } from 'phecda-server/express'
import express from 'express'
import { UserController } from './user.controller'

const data = await Factory([UserController],//初始化模块
{generators: [new HTTPGenerator()],//输出代码用于请求
})
const app = express()
const router = express.Router()

app.use(express.json())
bind(router, data)// 这里相当于给了router绑定了一堆express中间件
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
import Client from 'phecda-client/vite'

export default defineConfig({
  plugins: [Client()],
})
```

### 运行时
运行时的部分：
```ts
import axios from 'axios'
import { createChainReq } from 'phecda-client'
import type { UserController } from '../server/user.controller'
// 指向controller的路径！这里只是用它的类型，并没有真正引入Controller，

const instance = axios.create({
  baseURL: 'http://localhost:3699',
})
const request = createChainReq(instance, { user: UserController },)// 包装axios实例

const ret = await request.user.login('username', 'password')// 请求数据
```


