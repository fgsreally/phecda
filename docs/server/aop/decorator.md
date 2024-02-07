# 自定义装饰器
`PS`假定接口方法的入参，全部来源自客户端，

但在`nestjs`中，使用自定义装饰器时，要么用了服务端的数据，要么服务端参与处理，这和设计原理相悖。

所以在`PS`中，不支持参数级别的自定义装饰器

你可以使用上下文，实现一样的效果

```ts
@Controller('/')
class A {
  context: any
  @Get('')
  get() {
    const { request } = this.context// 但必须在方法的顶部！
    // do sth

  }
}
```
