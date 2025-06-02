# 测试
`ps`提供了内置的测试工具，可以与`vitest`等工具配合使用

这分为两部分，一部分是测试模块本身的功能，另一部分是测试`controller`接口

## 模块测试

```ts
import { TestFactory } from 'phecda-server/test'
class TestModule {
  add(num1: number, num2: number) {
    return num1 + num2
  }

}


const { get } = await TestFactory(X)

expect(get(X).add(1, 1)).toBe(2)
```


## 接口测试
> 基于`supertest`
```ts
import { Factory } from 'phecda-server'
import { bind as bindExpress } from '../src/http/express'
import { TestHttp } from 'phecda-server/test'
import express from 'express'


@Controller('/test')
class TestController  {
  @Get('/hello-world')
  helloWorld() {
    return 'hello world'

  }
}

const data = await Factory([TestController])
const app = express()
const router = express.Router()
app.use(router)
bindExpress(router, data)

const { module } = await TestHttp(app, data)

await module(TestController).helloWorld().expect(200, 'hello world')


```