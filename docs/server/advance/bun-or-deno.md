# bun or deno

由于`ps` 运行时使用了 `nodejs`特有的功能

在`bun/deno`中不能使用

一种简单的解决方法是：
> 前提是服务端框架自身要支持`nodejs`+`bun/deno`
1. 开发时仍使用`nodejs`，鉴于快速的热更新，这只会比直接使用`deno/bun`要快
2. 生产时通过`tsc`编译（不能使用`unimport/virtualFile`等运行时提供的功能）或者[打包](./bundle.md),对产物再使用`deno/bun`要快

