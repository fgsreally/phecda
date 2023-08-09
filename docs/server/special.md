# 特殊功能(实验性)
## 串行请求，并行请求 
`phecda-server`会开放一条路由，用于特殊请求（并行/串行请求）
`phecda-server`把接口调用抽象成函数调用，那么函数当然可以同时调用多个，或者类似函数式的`pipe`调用，但这样会发出多次请求，这完全可以合并成一次请求
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
import { $S, createParallelReq, createSeriesReq, isError, useC } from 'phecda-client'
import axios from 'axios'
import { TestController } from './test.controller'
const instance = axios.create({
  baseURL: 'http://localhost:3699/',
})
const useParallelReq = createParallelReq(instance)
const useSeriesReq = createSeriesReq(instance)
const { test, get, query } = useC(TestController)
// 串行调用
async function seriesRequest() {
  const { data: [, res2] } = await useSeriesReq([get(), test($S(0, 'data')/** 第零个函数（此时是get）的返回值后的data属性 */, '1', '2')])// 返回一个数组[{data:'test','test-1-2'}]
  console.log('[series request]:')

  if (isError(res2))// 类型保护
    console.error(res2.message)
  else console.log(res2)// test-1-2
}
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

> 个人觉得意义很小，但如果真的有需求的话，也可以试试，其仍会保留`nestjs`的相关功能