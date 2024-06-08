# 客户端

以前文中的`login`为例子：
```ts
import axios from 'axios'
import { createChainReq } from 'phecda-client'
import { UserController } from './user.controller'
const instance = axios.create({
  baseURL: 'server url',
})
const chain = createChainReq(instance, { user: UserController },)

async function request() {
  const isLogin = await chain.user.login('username', 'password')

  console.log(isLogin)// true
}
```

> 合并请求[详见](./routes.md)



## 服务端输出代码

但直接这样运行是不行的，

因为此时`Controller`来源服务端，而我们希望其指向服务端输出的代码

```ts
const data = await Factory([UserController], {
  generators: [new HTTPGenerator('.ps/http.js')],

})
```

那该如何使 `Controller`是来自`pmeta.js`呢？

有两种方法：
1. 如果是同个项目下，比如`monorepo`,使用[构建工具](./bundler.md)
2. 如果是不同项目下,使用[npm](./npm.md)
