# 跨项目

在[基础使用](../base.md#调用方调用)的案例中，客户端和服务端是在同一个项目中


而实际情况是：两者可能不在一个项目内，

其实原理是一样的：让类型指向服务端，让运行时指向服务端生成的代码




## 服务方

更改`package.json`
 

```json
{
  "name": "ps-test",
  "exports": {
    "./client": {
      "import": "./.ps/http.js",
      "types": "./dist/index.d.ts"
    }
  }

}
```
此时，入口`ps-test/client`的类型和实际代码引入并不相同

:::info ci/cd中构建产物
很显然，上面 index.d.ts 可以build出来，但http.js则一定需要程序运行时才产生，

那么在ci/cd中，可以”稍微“运行一下程序，产生产物后立刻结束，[详见](../runtime/command.md#phecda-server-generate-file)

:::

## 调用方
在调用端通过`npm`安装

```shell
npm i ps-test
```

然后：
```ts
import { UserController } from 'ps-test/client'
```

