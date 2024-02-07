# 命名规范
更多详见[phecda-core]()
 
1. `x.controller.ts`是http接口
2. `x.service.ts`是给对应`Controller`的服务
3. `x.rpc.ts`是暴露给rpc的服务
4. `x.guard/interceptor/pipe/filter/extension/plugin.ts`是aop相关的模块
5. `x.module.ts`供给上述所有的服务
6. `x.edge.ts`不供给给其他模块使用，单独运行，如时间总线
