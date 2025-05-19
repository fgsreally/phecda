# 元数据
```ts
//声明
@Tag('TestGuard')
class TestGuard extends PGuard<ExpressCtx> {
//...
}
//调用
@Guard('TestGuard')
class TestController {

}
```

你可能发现了，这里`aop`并不是直接引入，而是通过字符串找到注册的守卫/管道等

那么，当两个接口使用同样的守卫，但需要不同参数时，可以这样
```ts
@Tag('TestGuard')
class TestGuard extends PGuard<ExpressCtx> {
//...
use(ctx){
    ctx.define.test//true
}
}
//调用
@Guard('TestGuard')
@Define('test',true)
class TestController {

}

```

`Define`可以放在类/方法/参数上（优先级递增）