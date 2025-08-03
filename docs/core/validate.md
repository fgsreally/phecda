# 验证

基于元数据，以及部分装饰器的语义，实现验证

相关装饰器包括 `Rule/Const/OneOf/Enum/Required/Optional/Min/Max/Nested`

只会对被`pc`装饰器装饰的属性进行验证，如果没有被`Optional`装饰，那么就会被认为是必填项（和`Required`效果一致）


来个例子
```ts
import {validate} from 'phecda-core'
class Model{
@Min(1)//大于等于1
count:number//需要为数字
}
  const err = await validate(model, data, )
//err为错误信息数组，默认有一个错误就会中止验证并退出，所以err长度为1
// 如果validate 第三个参数为true，那么就会验证所有字段，err就可能不为1，但一个字段，最多只会有一个错误信息
// 比如count字段元数据number的验证如果错了，那么就不会走Min的验证，只有一条错误信息
// 如果需要自定义错误信息，那么可以通过validate的第四个参数
```

