# 命名规范
## 文件规范 
1. `x.controller.ts`是`http`接口
2. `x.service.ts`是给对应`Controller`的服务
3. `x.rpc.ts`是暴露给`rpc`的服务
4. `x.guard/interceptor/pipe/filter/extension/plugin.ts`是aop相关的模块
5. `x.module.ts`供给上述所有的服务
6. `x.edge.ts`不供给给其他模块使用，单独运行，如事件总线


## 其他
更多详见[phecda-core](./phecda-core.md)
