# 打包

如果需要打包，可以使用[unplugin-phecda-server](https://github.com/fgsreally/unplugin-phecda-server)（目前只测试过`vite`）

我不太推崇这个行为，

一是收益并不明显

二是打包过程中会导致类名发生更改（丑化）


这在`phecda`架构中很危险！

假设控制器类名原本为`TestController`，打包可能类名会变成`TestController2`,这会导致开发生产有较大区别

:::tip 解决方法
对所有控制器使用`Tag`，强制命名
:::