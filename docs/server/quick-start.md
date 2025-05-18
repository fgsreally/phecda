# 快速开始



## 服务端
### 安装依赖
```shell
npm i phecda-server 
```
### 初始化
```shell
npx phecda-server init
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
npx phecda-server index.ts
```


## 客户端
### 安装依赖
```shell
npm i phecda-client 
```
>  暂时支持`axios/alova`,也可以自行实现

### 编译时
> 这里只是作为一个最简单的例子方便用户跑通，把服务端和客户端代码放在了同一个项目里，所以需要`vite`插件帮忙
> 
> 真实的项目其实更简单，[详见](./build/cross-project.md)


以`vite`为例
```ts
import pc from 'phecda-client/unplugin'//使用了 `unplugin`，`vite/webpack/esbuild`都能用

export default defineConfig({
  plugins: [pc.vite({ })],
})
```

### 运行时
运行时的部分：
```ts
import axios from 'axios'
import { createClient } from 'phecda-client/http'
import {adaptor} from 'phecda-client/axios'
import { UserController } from '../server/user.controller'// 这里只是用它的类型，并没有真正引入Controller(利用了编译工具)

const instance = axios.create({
  baseURL: 'http://localhost:3000',
})

const client = createClient({user: UserController }, adaptor(instance))

const ret = await client.user.login('username', 'password')// 请求数据
```


