# 基础教学

## 初始化

本质上是将所有的模块，或者说是类，先控制反转+依赖注入将其实例化
然后根据`Tag`或者类名注册到`map`里

```ts
import { Factory, Tag } from 'phecda-server'
import { TestController } from './test.controller'

@Tag('test2')
class Test2Module {}

const data = await Factory([TestController, Test2Module])
data.modulemap.get('TestController') //  TestController 实例,此时使用了类名
data.modulemap.get('test2') //  Test2Module 实例,此时使用了tag
```

然后在将实例和服务端框架结合

<details>
<summary>Express</summary><br>

```ts
import { bindApp } from 'phecda-server/express'

// ..

const router = express.Router()
bindApp(router, data)// work for router
```

<br></details>


<details>
<summary>Fastify</summary><br>

```ts
// rollup.config.js
import { bindApp } from 'phecda-server/fastify'
const fastify = Fastify({
  logger: true,
})

fastify.register(bindApp(data))
```

<br></details>


<details>
<summary>h3</summary><br>

```ts
// rollup.config.js
import { bindApp } from 'phecda-server/h3'

const router = createRouter()
bindApp(router, data)
```

<br></details>

[详见]()

## 创建接口

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

`nestjs`使用者需要注意，这里的参数必须是来自客户端，不能使用特殊的自定义装饰器

举个例子，在中间件中，通过请求的请求头鉴权，获得用户信息

```ts
@Get()
test3(@User() user:any){

}
```

那么 这里的用户信息是来自服务端解析，而非用户端上传，这种写法会导致类型复用出问题。

### context

那以上功能该怎么实现呢，简单！只需要把信息挂到`context`上
> 守卫、拦截器、管道中都可以

```ts

@Get()
test3(){
const {user}=this.context//必须在顶部

//...
}

```

简而言之，函数的参数必须是来自客户端，而服务端的数据则通过`context`获得

通过`context`还能拿到原始的请求对象

以 express 为例 有的时候我们需要拿到`req`/`res`

```ts

@Get()
test3(){
const {request,response}=this.context//必须在函数顶部
}

```

:::warning 警告

> 请少这么做

1. 在插件处，还没有创建`context`
2. 这会导致跨框架出问题，因为像`koa`中没有`req`/`res`

:::




# 创建服务

只有一个 controller 显然过于单薄，controller 应可以调用`服务` 从而有更优雅的实现

```ts
import { Controller, Get, Param } from 'phecda'
@Injectable()// 具体可以看`模块`这一章
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

`nestjs`使用者请注意，只有通过构造函数实现依赖注入这一种方式，没有其他注入，原因[详见](./compare.md)

如果要通过构造函数 依赖注入，类必须被装饰器装饰

建议使用`Tag`,原因[详见](./advance.md)

```ts
@Injectable()
// or @Tag('test')
// or @Empty
class TestService {
  constructor(protected otherService: OtherService) {}

  test() {
    return 1
  }
}
```

建议所有`service`模块，都用`Tag`标记


前文中的
```ts
const data = await Factory([TestController])// 不需要添加TestService,它会作为TestController的依赖被处理
```