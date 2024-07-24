# 基础

## 基本结构

`ps` 中有这么一些角色，

> 抱歉，我无意设计的如此复杂，但前文所说的几个特性不太能用简单的办法解决，
>
> 不过不知道也没什么影响，反正我自己肯定是记不住的

1. **模块**也就是类，前文的`UserController/UserService`都是
2. **生成器**,它会生成一些代码，用于生成请求，即前文的`HttpGenerator`
3. **适配器**，它会和不同的服务端框架、微服务框架结合，也就是前文的`bind`
4. **编译器**，它会将原本的导入路径重定向到生成器生成的代码，在前端是`unplugin`插件，在服务端则是通过运行时
5. **请求适配器**，它会利用生成器生成的代码，并和`axios`等请求库结合，生成请求调用，即前文的`createChainReq`
6. **运行时**，利用`nodejs`的`register`提供热更新，通过命令行启动，即前文的`phecda <entryFile>`

## 基本流程

### 服务方：

1. 通过命令行，调用运行时，开始执行入口文件
2. 将模块通过实例化，使用生成器生成请求相关代码
3. 通过适配器，与服务端框架适配

### 调用方

1. 通过编译器，更改指向
2. 通过请求适配器，生成请求调用

## 实例化模块并生成代码

本质上是将所有的模块，或者说是类，控制反转+依赖注入将其实例化，然后根据`Tag`或者类名注册到`modulemap`里，并将模块上的元数据收集到`meta`数组中，
再根据元数据产生代码

> `Tag`或者类名作为模块的标识，在`Phecda`架构中很重要，[详见](./advance/module.md#模块覆盖)

```ts
import { Factory, HttpGenerator, Tag } from 'phecda-server'

class TestModule {}

@Tag('test2')
class Test2Module {}

const data = await Factory([TestModule, Test2Module], {
  generators: [new HttpGenerator()],
})
data.modulemap.get('TestModule') //  TestController 实例,此时使用了类名
data.modulemap.get('test2') //  Test2Module 实例,此时使用了tag
data.meta // 元数据数组
```

:::tip
`ps`中模块（类）分为以下几种，

> 啊，前面的角色不重要，这个真的很重要

1. **控制器**，负责把服务暴露给外部，在`express`中对应着`controller`（类名为`XXController`），负责暴露`http`接口，
   在`rabbitmq`中对应着`rpc`（类名为`XXRpc`），负责暴露队列

2. **服务模块**，主要是给控制器提供服务，对应着`service`（类名为`XXService`）
3. **基础模块**，主要是提供一些基础能力给其他模块使用，对应着`module`（类名为`XXModule`）
4. **`AOP`模块**， 提供`aop`功能（类名为`XXPipe/XXGuard/XXFilter/XXPlugin/XXInterceptor、XXExtension`）
5. **边缘模块**，不被其他模块调用的模块，主要用于定时器、事件总线（类名为`XXEdge`）

实例化时，只需要直接引入`1/4/5`，`2/3`会被间接引入
如

```ts
const data = await Factory([XXController, XXGuard, XXEdge])
```

:::

### 通过控制器创建接口

```ts
import { Body, Controller, Param, Post, Query } from 'phecda'
@Controller('/base')
class TestController {
  @Post()
  test1(@Body() body: string, @Query('name') name: string) {
    // axios.post('/base','body',{params:{name:'name'}}) ---> 'bodyname'
    return body + name
  }

  @Post('/test2')
  test2(@Body('a') a: string, @Body('b') b: string) {
    // axios.post('/base/test2',{a:'a',b:'b'},) ---> 'ab'
    return a + b
  }

  @Post('/:test')
  test3(@Param('test') test: string) {
    // axios.post('/base/1') ---> '1'
    return test
  }
}
```

:::danger

`nestjs`使用者需要注意，这里的参数必须是来自客户端，不能使用特殊的自定义装饰器

举个例子，在守卫中，通过请求的请求头鉴权，获得用户信息

```ts
@Get()
test3(@User() user:any){

}
```

那么 这里的用户信息是来自服务端解析，而非用户端上传，这种写法会导致类型复用出问题。

`PS`中禁止这么做

:::

### 上下文

那以上功能该怎么实现呢，简单！只需要把信息挂到上下文

> 守卫、拦截器、管道中、过滤器都可以操作上下文

```ts{9}
import { Ctx, Get } from 'phecda-server'
import type { ExpressCtx } from 'phecda-server/express'
class TestController {
  @Ctx
  context: ExpressCtx

  @Get()
  test3() {
    const { user } = this.context // 必须在函数顶部

    // ...
  }
}
```

简而言之，函数的参数必须是来自客户端，而服务端的东西则通过上下文获得

### 为控制器创建服务

```ts
import { Controller, Get, Param } from 'phecda-server'
@Injectable()
class TestService {
  test() {
    return 1
  }
}

@Controller('/base')
class TestController {
  constructor(protected testService: TestService) {}

  @Get()
  get() {
    return this.testService.test()
  }
}
```

:::warning
`nestjs`使用者请注意，只有通过构造函数实现依赖注入这一种方式，没有其他注入，原因[详见](./other/compare.md)
:::

前文中的

```ts
const data = await Factory([TestController])
```

此时不需要添加 `TestService`,它会作为 `TestController` 的依赖被处理

## 与服务端框架适配

<details>
<summary>Express</summary>

```ts
import { bind } from 'phecda-server/express'

// ..

const router = express.Router()
bind(router, data) // work for router
```

</details>

<details>
<summary>Fastify</summary>

```ts
import { bind } from 'phecda-server/fastify'
const app = Fastify()

bind(app, data)
```

</details>

<details>
<summary>koa</summary>

```ts
import { bind } from 'phecda-server/koa'

// ..
const router = new Router()
bind(router, data)
```

</details>
<details>
<summary>h3</summary>

```ts
import { bind } from 'phecda-server/h3'

const router = createRouter()
bind(router, data)
```

</details>

<details>
<summary>hyper-express</summary>

```ts
import { bind } from 'phecda-server/hyper-express'
// ..
const router = new HyperExpress.Router()
bind(router, data)
```

</details>

<details>
<summary>hono</summary>

```ts
import { bind } from 'phecda-server/hono'
// ..

const router = new Hono()
bind(router, data)
```

</details>

## 调用方调用

```ts
import axios from 'axios'
import { createChainReq } from 'phecda-client'
import { UserController } from '../server/user.controller'

const instance = axios.create({
  baseURL: 'http://localhost:3699',
})
const request = createChainReq(instance, { user: UserController }) // 包装axios实例

const ret = await request.user.login('username', 'password') // 请求数据
```

这里引入控制器并不是真正引入了，只是借用其类型，真正引入的是生成器的代码

很明显，这是个重定向性质的行为，[快速开始](./quick-start.md)里通过`vite`插件，

但通过命令`phecda <entry file>` 也可以实现，

> 这里之所以说调用方而不是前端或者客户端，因为也可以是服务端不同程序之间的调用
>
> 通过命令行的方法就是用于这种情况

具体的重定向配置，[详见](./advance/command.md)


