# 元数据
你可能发现了，这里`aop`并不是直接引入，而是通过字符串

那么，当两个接口使用同样的守卫，但需要不同参数时，可以这样

```ts
//声明
@Tag('TestGuard')
@Define('test',true)
class TestGuard extends PGuard<ExpressCtx> {
//...
}
//调用
@Guard('TestGuard')
class TestController {
use(ctx){
ctx.define.test//true

}
}
```

`Define`可以放在类/方法/参数上（优先级递增）