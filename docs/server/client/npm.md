# npm


当需要跨项目时，由于`typescript`的限制，常规方法几乎只有`npm`这一种


那么可以这样：


## 服务端
服务端一侧，有两个`export`，一个是正常的`export`，另一个导出的是`pmeta.js`，但对应类型与前者相同

```json
{
  "name": "ps-test",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./client": {
      "import": "./dist/pmeta.js"
    }
  },
  "typesVersions": {
    "*": {
      ".": [
        "dist/index.d.ts"
      ],
      "client": [
        "dist/index.d.ts"
      ]
    }
  }
}
```


## 客户端
在客户端通过`npm`安装

然后：
```ts
import { UserController } from 'ps-test/client'
```