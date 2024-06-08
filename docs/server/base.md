# 基础教学

## 实例化模块

本质上是将所有的模块，或者说是类，控制反转+依赖注入将其实例化，然后根据`Tag`或者类名注册到`modulemap`里

> `Tag`或者类名作为模块的标识，在`Phecda`架构中很重要，[详见](./module.md#模块覆盖)


```ts
import { Factory, Tag } from 'phecda-server'

class TestModule {}

@Tag('test2')
class Test2Module {}

const data = await Factory([TestModule, Test2Module])
data.modulemap.get('TestModule') //  TestController 实例,此时使用了类名
data.modulemap.get('test2') //  Test2Module 实例,此时使用了tag
```

然后再将其和服务端框架结合

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
const app = Fastify({
  logger: true,
})

app.register(bind(app, data))
```

</details>

<details>
<summary>koa</summary>

```ts
import Koa from 'koa'
import { koaBody } from 'koa-body'
import Router from '@koa/router'
import { bind } from 'phecda-server/koa'
import { Factory } from 'phecda-server'

const app = new Koa()
const router = new Router()

app.use(koaBody())

bind(router, data)
app.use(router.routes()).use(router.allowedMethods())
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


## 创建接口

<!-- :::info
`ps`中有两种基本类，
一种是`controller`，负责暴露服务给外部，这里就是`http`接口

一种是`service`，为`controller`提供功能服务
::: -->

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

举个例子，在中间件中，通过请求的请求头鉴权，获得用户信息

```ts
@Get()
test3(@User() user:any){

}
```

那么 这里的用户信息是来自服务端解析，而非用户端上传，这种写法会导致类型复用出问题。

`PS`中禁止这么做

:::

## 上下文

那以上功能该怎么实现呢，简单！只需要把信息挂到`context`上

> 守卫、拦截器、管道中都可以操作`context`

```ts
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

简而言之，函数的参数必须是来自客户端，而服务端的东西则通过`context`获得

## 创建服务



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
