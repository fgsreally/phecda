# 跨项目
可能服务方和调用方不在一个项目内，或者说不共享一个`package.json`

需要跨项目复用代码和类型，可以：

## monorepo
通过[配置文件](./command.md#phecda-init)，把路径导向正确的位置

## npm 
很遗憾，`ts`并没有官方的跨项目的解决，`npm`看上去是跨项目唯一的答案

### 服务方

更改`package.json`


```json
{
  "name": "ps-test",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"

    },
    "./http": {
      "import": "./.ps/http.js",
      "types": "./dist/index.d.ts"

    }
  }

}
```


## 调用端
在调用端通过`npm`安装

```shell
npm i ps-test
```

然后：
```ts
import { UserController } from 'ps-test/http'
```