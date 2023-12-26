# 专用路由

`phecda-server`会开放一条路由，用于并行请求
`phecda-server`把接口调用抽象成函数调用，那么函数当然可以同时调用多个，但这样会发出多次请求，这完全可以合并成一次请求

> 只针对于`server`框架，`rpc`没有
> 专用路由会执行所有调用函数的守卫、拦截器，这意味着一次请求可能调用同个守卫、拦截器多次，请通过条件判断，防止重复鉴权等行为
> 专用路由不会执行调用函数的插件（因为绝大部分`server`框架没有这种动态的支持），所以在`bindApp`中配置项`plugins`就是专门给专用路由使用的插件



## 案例

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
  async test(@Param('test') test: string, @Body('name') name: string, @Query('id') id: string) {
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
  baseURL: 'http://localhost:3699/',
})
const useParallelReq = createParallelReq(instance)
const { test, get, query } = useC(TestController)

// 并行调用
async function parallelRequest() {
  const { data: [res1, res2] } = await useParallelReq([test('0', '1', '2'), get()])// 返回一个数组[{data:'test'},'0-1-2']
  console.log('[merge request]:')

  if (isError(res1))// 类型保护
    console.error(res1.message)
  else console.log(res1)

  if (isError(res2))
    console.error(res2.message)
  else console.log(res2)
}
```

