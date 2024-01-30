# npm

`monorepo`中，使用插件似乎并不麻烦，可以通过路径，直接找到生成代码的文件，但如果不是呢？

## npm

很不幸，几乎只有`npm`一种方法，能保留类型

那么可以这样：

1. 服务端中，假设将`client`代码输出到`client.js`，所有模块打包到`index.js`
   在 package.json 中：

```json
{
  "name": "backend",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./client": {
      "import": "./dist/client.js"
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

在客户端通过`npm`安装然后
```ts
import { TestController } from 'backend/client'
```