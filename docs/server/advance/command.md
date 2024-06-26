# 命令行工具
## phecda init
初始化`tsconfig.json`和`ps.json`，后者会被`register`读取，
其配置如下：
```json5
{
  "$schema": "node_modules/phecda-server/bin/schema.json",
  "resolve": [
    {
      "source": "controller",
      "importer": "http",
      "path": ".ps/http.js"// 如果本文件是 *.http.ts ,引入了另一个*.controller.ts，那么这个引入会重定向至`.ps/http.ts`
    },
    {
      "source": "rpc",
      "importer": "client",
      "path": ".ps/rpc.js"// 如果本文件是 *.client.ts ,引入了另一个*.rpc.ts，那么这个引入会重定向至`.ps/rpc.ts`
    }
  ],
  "unimport": false, // 需要单独安装unimport,这些配置会传到createUnimport中
  "virtualFile": { // 虚拟文件
    "virtual:a": "console.log(1)"
  },
  "moduleFile": ["test"]// 默认只有命名规范中的文件会触发热更新，现在 *.test.ts 也会
}
```

## phecda generate [file]
启动程序，使生成器产生代码，然后退出
用于`ci/cd`



## phecda [file]
启动程序，除非单独设置环境变量`NODE_ENV`为非`development`，否则都启动热更新

还有一些环境变量配置：
1. `PS_STRICT` 如果设置，那么使用了未设置的守卫、拦截器等，会直接报错
2. `PS_LOG_LEVEL`  info/log/warning/error 对应0到3，只有高于`PS_LOG_LEVEL`的信息才会被输出


输入`e`并回车会退出程序，输入`r`回车会完全重启

添加给`nodejs`的参数需:
```shell
npx phecda file.ts -- --inspect
```