# phecda-web

`phecda-web`是为了`Phecda`在浏览器端的实现，

其包含`phecda-core`的所有，并实现了`phecda-core`未实现的装饰器，如`Storage`

:::info 共同点

和`phecda-server`一致，也是通过`Tag/类名`去标记模块，且是唯一标记，

只会加载第一个，后续同名模块被忽略

且也是单例模式，每个`model`只会被实例化一次
:::



由于现代前端开发几乎都是基于响应式，即数据变化通过框架自行更改视图

并不能直接使用`phecda-web`,而是要在此基础上，根据不同框架，蛇者响应式数据的实现，再进行一次封装

## 支持框架
目前支持
1. [phecda-vue](./vue/base.md)
2. [phecda-react](./react/base.md)

也可以自行封装

:::warning 前提
两个前提：

1. 构造函数的依赖注入需要编译支持`ts`元数据，建议使用`unplugin-swc`(如果不用也没事，只是不能构造函数注入)

2. 框架必须要支持深层响应的响应式数据，最典型的是`vue`中的`ref`

:::

