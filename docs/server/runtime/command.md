# 命令行工具

:::info
不要太在意，用一下就知道了
:::

## phecda-server init
初始化`tsconfig.json`和`ps.json`，后者会被运行时读取，
一个例子：
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

## phecda-server generate [file]
启动程序，使生成器生成代码，然后退出
用于`ci/cd`



## phecda-server [file]
启动程序，这是最常用的





### 交互命令
输入`e`回车会退出程序

输入`r`回车会完全重启

输入`i`回车会切换调试模式(`i host:port/i port`可以指定端口)

> 默认不使用`sourcemap`,因为`loader`处理后的内联`sourcemap`存在一些问题，会看不到作用域（至少在浏览器调试中，原因未知）

### nodejs 参数
传递给`nodejs`的参数需:
```shell
npx phecda file.ts --nodeArgs="--inspect-brk"
```