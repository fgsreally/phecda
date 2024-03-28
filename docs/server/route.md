# 专用路由&h 合并请求

`phecda-server`会开放一条路由，用于合并请求,和`trpc`类似

把接口调用抽象成函数调用，那么函数当然可以同时调用多个，

但这样会发出多次请求，这完全可以合并成一次请求

> 只针对于`server`框架，`rpc`没有


```ts
const chain = createChainReq(
  instance,
  { test: UserController },
  { batch: true }
)
```

<!-- ## 案例

假设有一个`controller`：

```ts
@Controller('/base')
@Tag('test')
export class TestController {
  @Get('/get')
  async get() {
    return {
      data: 'test',
    }
  }

  @Post('/:test')
  async test(
    @Param('test') test: string,
    @Body('name') name: string,
    @Query('id') id: string
  ) {
    return `${test}-${name}-${id}`
  }
}
```

那么可以

```ts
import { createParallelReq, isError, useC } from 'phecda-client'
import axios from 'axios'
import { TestController } from './test.controller'
const instance = axios.create({
  baseURL: 'server url',
})
const chain = createChainReq(
  instance,
  { test: TestController },
  { batch: true }
)

const [res1, res2] = await Promise.all([
  chain.test.test('a', 'b', 'c'),
  chain.test.get(),
]) // 返回一个数组['a-b-c',{data:'test'}]

if (isError(res1))
  // 类型保护
  console.error(res1.message)
else console.log(res1)

if (isError(res2))
  console.error(res2.message)
else console.log(res2)
``` -->
