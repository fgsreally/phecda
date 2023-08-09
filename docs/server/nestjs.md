# nestjs
`phecda-server`可以实现类似`nestjs`的功能，形式稍有不同

## 守卫/拦截器/中间件
```ts
import { Guard, Interceptor, Middle } from 'phecda-server'

export class UserController {
  @Guard('test')
  @Middle('test')
  @Interceptor('test')
  @Post('/:test')
  test(@Param('test') test: string) {
  // ..
  }
}
```
然后在入口中

```ts
import { addGuard, addInterceptor, addMiddleware } from 'phecda-server'
addMiddleware('test', () => {

})

addGuard('test', ({ request }) => {
  if (request.params.test !== 'test')
    return false
  return true
})
addInterceptor('test', () => {
  fn('start')
  return () => {
    fn('end')
  }
})
```
> 依赖注入！

### 全局守卫和拦截器

```ts
bindApp(app, data, { globalGuards: ['test'] })
```

## 管道和过滤器
管道和过滤器必须是全局设置，也就是所有共用同样的，且不能设置多个（防止问题变复杂）。
默认提供的管道和过滤器[详见]()，根据需求编写自己的管道和过滤器
在入口文件
```ts
import { useServerFilter, useServerPipe } from 'phecda-server'
useServerFilter(/** */)
useServerPipe(/** */)
```


