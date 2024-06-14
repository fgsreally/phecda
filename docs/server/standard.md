# 规范




## 文件名规范 
### 模块文件
一个文件一个模块（类），务必遵守，否则可能导致`ps`运行时出问题
> 内置的规范
具体[详见](./base.md#实例化模块并生成代码)
1. `*.controller.ts` <--> `XXController`
2. `*.service.ts` <--> `XXService`
3. `*.rpc.ts` <--> `XXRpc`
4. `*.guard/interceptor/pipe/filter/extension/plugin.ts` <--> `XXPipe/XXGuard/XXFilter/XXPlugin/XXInterceptor/XXExtension`
5. `*.module.ts` <--> `XXModule`
6. `*.edge.ts` <--> `XXEdge`


