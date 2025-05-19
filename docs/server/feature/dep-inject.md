# 依赖注入
假设需要一个模块引用另一个模块，那么需要依赖注入

和`nestjs`不同,`PS`只能通过构造函数注入，不提供其他任何注入方式

```ts
class A{

}

@Injectable()//一定要有一个装饰器，从而触发元数据的收集，Injectable本身就是个空函数
class B{
  constructor(protected a:A){}
}




```