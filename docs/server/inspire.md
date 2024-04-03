# 灵感来源

先从一个`nestjs`案例开始

这是一个登录的接口，只需要在浏览器端，朝着`/user/login`发请求就行，

```ts
@Controller('/user')
class User {
  @Post('/login')
  login(@Query('name') name: string, @Query('password') password: string) {
    // 仔细看这一行！
    // ..
    if (password === 'password')
      return true

    return false
  }
}
```

能看出两件事：

### `nestjs`的格式已经提供了类型

一件不难看出的事情是：

这里其实已经提供了请求参数的类型`(name:string,password:string)`

和返回值的类型(`boolean`)，

只需要想法设法让其能被前端利用。

### 请求方式/路由/数据位置？无所谓

另一件很关键的事情是：

服务端只是需要两个参数，至于这两个参数来自`body`还是其他地方，通过`Get`还是`Post`,走的路由是什么，服务端自己是知道的！

既然服务端是知道的，那么开发者是否可以不用知道？

我可不可以让接口的调用，变成函数的调用，也就是，我只关心入参和返回的值，至于这个参数是挂载到`body`还是`query`，是走什么路由，是`GET`还是`POST`,我不用去管（屏蔽掉`HTTP`这个层面的东西，完全回归到函数这个层级上），

> `nestjs`的自定义装饰器，显然不满足这种情况，所以不得不自己搞一套，[详见](./base.md#context)

## 结论

这给我了一点想法,前端中完全可以这么调用:

```ts
const isLogin = await login('phecda-server users', 'password') // 这样就可以直接复用服务端类型！
```

一个不算坏的方案是：

服务端得到一些元数据，包含路由，请求方式等信息，然后创建可被前端利用的代码。

前端利用这些基础代码再去创建基本请求
