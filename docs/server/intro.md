# phecda-server
渐进的、追求复用的，以函数的形式的服务端框架


:::tip need to konw
1. 长得像`nestjs`的`trpc`，
2. 基于`express`,低侵入
3. 基于依赖注入的`phecda-core`标准，
:::

> 我认为它在小型项目上能够提供一流的体验与标准，我目前正在多个项目中实践`phecda-server`
> 即使是大型项目,由于渐进+低侵入，迁移上手简单，风险低

## 灵感来源
先从一个`nestjs`案例开始
> 这是一个登录的接口，只需要在浏览器端，朝着`/user/login`发请求就行，

```ts
@Controller('/user')
class User {
  @Post('/login')
  login(@Body() name: string, @Query() version: string) { // 仔细看这一行！
    // ..
  }
}
```
一件不难看出的事情是：这里其实已经提供了类型，也就是两个参数，类型是字符串，只需要想法设法让这个类型能被前端所利用。

另一件很关键的事情是：服务端只是需要两个参数，至于这两个参数来自`body`还是其他地方，通过`Get`还是`Post`,走的路由是什么，服务端自己是知道的！既然服务端是知道的，那么开发者是否可以不用知道？

这给我了一点想法：我可不可以让接口的调用，变成函数的调用，也就是，我只关心入参和返回的值，至于这个参数是挂载到`body`还是`query`，是走什么路由，是`GET`还是`POST`,我不用去管（屏蔽掉`HTTP`这个层面的东西，完全回归到`js`函数这个层级上），

如果可以的话，那么前端中完全可以这么调用:

```ts
const ret = await login('fgs', '1')// 这样就可以直接复用服务端类型！
```
当然这种改动是破坏性的，而我更希望其能够符合`RESTFUL`的标准，方便迁移，让使用者更能接受一点

一个不算坏的方案是：服务端输出一些元数据，包含路由，请求方式等信息，然后前端通过编译时，用这些元数据创造出一些函数方法,从而使得这些方法能够绑定对应的路由、请求方式、挂载位置，然后应用层面上就只需要关心方法这个层级了

> 写法上和`nestjs`基本保持一致，也有守卫/管道/拦截器/过滤器，但能够实现`trpc`类似的类型复用，即` 长得像nestjs的trpc`；因为同时需要服务端运行+前端编译，即`运行时+编译时`；

这种屏蔽实现细节，仅暴露函数调用的思路，不仅仅能用于`express`等服务端框架,`rabbitmq`等一样可以,即`跨技术栈`;关于依赖注入，[详见](./nestjs.md)


## 快速开始

### 服务端
以`express`为例
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
const data = await Factory([UserController])
data.output()// 输出元数据，最好是js结尾，默认是pmeta.js
const app = express()
app.use(express.json())
bindApp(app, data)// 这里相当于给了app绑定了一堆express中间件
app.listen(3000)
```

### 客户端
当然，这取决于用什么库去实现请求，如果是`axios`，那么安装`phecda-client`
> 其他的话就要自己实现一个类似`phecda-client`的东西了
#### 编译时
编译方面，以`vite`为例
```ts
import PC from 'phecda-client/vite'

export default defineConfig({
  plugins: [PC({ localPath: './pmeta.js'/** 元数据文件的路径 */, port: ' http://localhost:3699/', })],
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
注意两点：
1. 由于需要对应类型，所以在参数层面，不支持自定义装饰器，因为自定义装饰器对应的数据，可能是来自于中间件而非客户端，这不符合函数入参的逻辑
2. 在接口中拿到`req`/`res`，可以通过`controller`上的`context`拿到，但注意，这必须在接口中顶部去拿
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
2. 不能接收`module`的类名或者`Tag`（优先级更高，有就不用管类名）重复，必须保证唯一

:::