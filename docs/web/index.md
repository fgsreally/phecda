# phecda-web

`phecda-web`是为了`Phecda`在浏览器端的实现，

> 显然和服务端的`ps`有一些区分

其包含`phecda-core`的所有，并实现了`phecda-core`未实现的装饰器，如`Storage`

唯一需要注意的是，它依赖于两个点，

1. 构造函数的依赖注入，这需要编译支持`ts`元数据，建议使用`unplugin-swc`

2. 框架必须要实现深层响应的响应式数据，最典型的是`vue`中的`ref`