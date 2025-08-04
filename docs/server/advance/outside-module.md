# 模块外使用
之前的例子，都是模块调用模块，那还有一种情况，就是模块外需要调用模块


比如，你需要在老`express`项目中，旧的路由体系里，使用模块的功能，那么可以这样：
```ts
app.use('',()=>{
    const User=useS(UserModule)// 必须要等Factory执行完毕，才能获取到模块实例，如果没有，那么需要前面添加await
})
```

如果你需要模块能游离在整个`ps`体系之外，即不通过`factory`实例的方式，那么可以通过命名空间:
```ts
import { useS } from 'phecda-server'
const User=await useS(UserModule,'my-namespace') 
```

不仅用于模块外，还可用于解决循环依赖的问题