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
<summary>EXpress</summary><br>

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

那以上功能该怎么实现呢，简单！只需要在守卫、中间件、拦截器中把信息挂到`context`上

```ts

@Get()
test3(){
const {user}=this.context//必须在函数顶部
}

```

简而言之，函数的参数必须是来自客户端，而服务端的数据则通过`context`获得

当然，以 express 为例 有的时候我们需要拿到`req`/`res`对象，这也要通过`context`

```ts

@Get()
test3(){
const {request,response}=this.context//必须在函数顶部
}

```

:::info info
直接操作`req`/`res`需要注意

> 请少这么做

1. 一般而言，只有使用`express`中间件时（这个时候还没有创建`context`）,将某个东西挂到了`req`上面，只有这种情况使用`req`
2. 一般而言，只有[这种情况](./problem.md)需要使用`res`
3. 这会导致跨框架出问题，因为像`h3`/`koa`中没有`req`/`res`

:::

### 管道

显然，我们需要对参数进行一些处理（主要是验证），可以为参数选择指定管道！
默认使用`default`管道,其效果如下

```ts
import { Body, Controller, Post, To } from 'phecda-server'

class BodyData {
  @To((param: any) => {
    if (age < 18)
      throw new Error('too young')
    return age + 1
  })
  age: number
}

@Controller('/test')
class TestController {
  @Post()
  test4(@Body() body: BodyDatas) {}
}
```

当请求体中的 age 为 17，就会报错，为 19 的话，body.age 就会得到 20

你也可以设置 pipe

```ts
import { Controller, Pipe, Post, Query, To, addPipe } from 'phecda-server'

addPipe('test', ({ arg, reflect }) => {
  // reflect:Number 元数据
  return reflect(arg)
  // 将query的参数类型转为 number
})

@Controller('/test')
class TestController {
  @Post()
  test4(@Query() @Pipe('test') name: number) {
    // 使用test 管道
  }
}
```

但一个参数，只能使用一个管道

### 过滤器

过滤器全局唯一，负责处理处理报错

```ts
import { BadRequestException } from 'phecda-server'
@Controller('/test')
class TestController {
  @Post()
  test4(@Query() name: number) {
    throw new BadRequestException('error!!')
  }
}
```

收到报错信息如下

```json
{
  "message": "error!!",
  "description": "Bad Request",
  "status": 400,
  "error": true
}
```

默认过滤器如下：

```ts
import type { P } from 'phecda-server'
import { Exception } from 'phecda-server'
export const defaultFilter: P.Filter = (e: any) => {
  if (!(e instanceof Exception)) {
    console.error(e.stack)
    e = new UndefinedException(e.message || e)
  }
  else {
    console.error(e.message)
  }

  return e.data
}
```

你可以设计自己的过滤器,从而记录错误日志 or 其他
也可以继承`Exception`，设计特定的错误信息

> 注意，过滤器是处理**错误**的，意味着请求没有被成功处理，状态码不为 2 开头，过滤器不要去`忽略`错误

### 中间件

中间件显然是完全无法跨框架的,nest 搞的那么复杂也只能支持 express+fastify，这还需要一大堆其他依赖来兼容处理
所以使用了注入的模式，不同框架中注入不同中间件，

在 express/h3/koa 中对应中间件,fastify 中对应 register 的插件

```ts

addMiddleware('auth',()=>false)

//...
@Middle('test')
@Get()
get(){

}

```

### 守卫

主要用于鉴权
运行在中间件之后

```ts

addGuard('auth',()=>false)

//...
@Guard('auth')//使用auth guard
@Get()
get(){

}

```

:::warning 提醒
在守卫中很可能直接操作`context`/`req`/`res`
意味着可能无法跨框架，和中间件一样，不同框架中设置不同守卫就行
当然也可以写一个守卫，然后里面 if-else（这个中间件就做不到了），但不推荐

拦截器也一样

:::

### 拦截器

```ts

addInterceptor('test',()=>{//守卫执行后，管道执行前
return ()=>{

}// 函数执行后

})

//...
@Interceptor('test')
@Get()
get(){

}

```

如果拦截器返回不是 function/undefined，那就直接返回给客户端，不会再执行函数（用于缓存）

:::info
这些装饰器挂在方法上，就是只有这个接口使用，挂在类上，就是这个类上所有接口使用
当然也可以设置全局

```ts
bindApp(app, data, {
  globalGuards: ['tests'],
})
```

:::

# 创建服务

只有一个 controller 显然过于单薄，controller 应可以调用`服务` 从而有更优雅的实现

```ts
import { Controller, Get, Param } from 'phecda'

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