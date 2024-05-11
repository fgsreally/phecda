# 命名规范
## 文件规范 
1. `*.controller.ts`是`http`接口
2. `*.service.ts`是给对应`Controller`的服务
3. `*.rpc.ts`是微服务
4. `*.guard/interceptor/pipe/filter/extension/plugin.ts`是aop相关的模块
5. `*.module.ts`供给上述所有的服务
6. `*.edge.ts`不供给给其他模块使用，单独运行，如事件总线
7. `*.http.ts`调用上述`http`接口
8. `*.client.ts`调用上述微服务

