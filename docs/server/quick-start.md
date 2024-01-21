# 快速开始

## 服务端
以`express`为例,
> 案例尽量和`nestjs`保持一致
创建一个`user.controller.ts`和`user.service.ts`

```ts
// in user.service.ts
import { Tag } from 'phecda-server'

@Tag('user')
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
import { UserController } from './user.controller'
const data = await Factory([UserController], {
  http: 'pmeta.js'// 输出的http的代码
})
const app = express()
app.use(express.json())
bindApp(app, data)// 这里相当于给了app绑定了一堆express中间件
app.listen(3000)
```
其他框架[详见](./base.md)

## 客户端
当然，这取决于用什么库去实现请求，如果是`axios`，那么安装`phecda-client`
> 其他的话就要自己实现一个类似`phecda-client`的东西了
#### 编译时
编译方面，以`vite`为例
```ts
import PC from 'phecda-client/vite'

export default defineConfig({
  plugins: [PC({ localPath: './pmeta.js'/** 元数据文件的路径 */,  })],
})
```

#### 运行时
运行时的部分：
```ts
import axios from 'axios'
import { createReq } from 'phecda-client'
import { UserController } from './user.controller'// 指向controller的路径！这里只是用它的类型，不是真的引入了Controller，
// 文件名包含controller和route的，都会如此（不是什么文件都行），如要更改配置，请看插件的配置项
const instance = axios.create({
  baseURL: 'http://localhost:3699',
})
const useRequest = createReq(instance)
const { login } = useC(UserController)

async function request() {
  const { data } = await useRequest(login('username', 'version'))

  console.log(data)// user1
}
```
::: warning 提醒

1. 由于需要对应类型，所以在参数层面，不支持自定义装饰器，因为自定义装饰器对应的数据，可能是来自于中间件而非客户端，这不符合函数入参的逻辑
2. 在接口中拿到`req`/`res`，可以通过`controller`上的`context`拿到，但注意，这必须在函数顶部去拿

具体[详见](./base.md#context)
```ts
@Controller('/')
class A {
  context: any
  @Get('')
  get() {
    const { request } = this.context// 必须在顶部拿
    // do sth

  }
}
```
3. 使用了元数据， 所以请为每个类都打上装饰器（在构造函数有依赖的类必须要

:::

:::error 提醒
鉴于`PS`的基于函数的模式，没法处理以下几种情况

1. 入参无意义：
   比如文件上传，前端上传的是`fileList`,而后端往往是操作被中间件处理后的东西，这导致函数体中根本不使用入参

2. 不符合入参+返回值的模式
   比如 `websocket/sse`等

以上情况并非不能实现，而是意义很小

:::