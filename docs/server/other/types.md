# 类型杂技

我很羡慕类似`tsrpc`的、轻装上阵的类型系统，但这过于有魄力了一点
> 简而言之，就是把类型声明（`interface/types`）当`schema`用，
> 比如，声明一个请求 的`interface`，假设叫`RequestBody`, 那么请求体就会受到这个类型的制约（运行时）
>
>但这也有问题，因为类型既要为前端提供类型，又要在后端当作类型，又要做 `schema`
>
>这可能会导致需要非常多的类型定义：请求一份，响应一份，前端一份，后端一份

`PS`不依赖特定规范使用`ts`,有的时候就会束手束脚。


## 类型难题

最常见的是前后端中数据结构有所不同

随便举一个例子：
```ts
class Strudent {
  name: string
  run() {

  }
}

class A {
  @Post('')
  test(@Body() student: Strudent, @Query('id') @Pipe('objectId') id: ObjectId) {

  }

}
```
前端我们真实输入的参数是
1. 一个只有name的对象（没有方法），（后端中是一个类实例）
2. 一个字符串（后端中是`mongodb`的`objectId`）



## 类型欺骗
有一些很取巧的方法（也许不是个好办法），这些方法本质是去“欺骗” ts服务器

### 关于`class`
```ts
import { toClass } from 'phecda-client'

request.A.test(toClass<Student>({ name: 'student name' }))
```
> 关于`class`或许有更好的办法，只要`phecda-client`中做出一个`DeepOmitFunction`或者`DeepJson`之类的泛型，就能搞定！但嵌套的类型会给可读性和性能造成一些麻烦，暂未实装（表示不会这个体操）

关于`objectId`
> 这种情况复杂得多，前后端操作的数据结构不一致，这需要后端配合！
> 换句话说，这里需要一个特殊的协议，既要让后端在管道中运行时转换，又要欺骗前端`ts`的类型

后端中设一个专门的`pipe`,标记为`objectId`,负责将`xxxxx`转化为`new ObjectId(xxxxx)`（运行时转换）

再提供一个方法（欺骗前端类型）
```ts
function toObjectId(input: string): ObjectId {
  return input as any
}
```


然后前端
```ts
import { toClass } from 'phecda-client'
import { toObjectId } from 'backend'
request.A.test(toClass({ name: 'student name' }), toObjectId('xxxx'))// 本质还是字符串，在管道中转为objectid
```
