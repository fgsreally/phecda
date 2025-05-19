
# 内置模块
`PS`提供了一些内置的模块，比如前文`aop`中的`PGuard/PPipe/PAddon/PFilter/PExtension`都是内置模块

这些模块提供了一些好用的功能,你可以继承这些模块，从而更方便的实现自己的需求


## 基础模块

所有的内置模块都是基于`ServerBase`的


```ts
class ServerBase {

//模块标识    
  tag:PropertyKey

//日志
  log(msg: unknown, level: LogLevel = 'log') {
    log(msg, level, this.tag)
  }

//事件总线相关
  on:<Key extends keyof Events>(type: Key, handler: (arg: Events[Key]) => void)=>void 
  emit:<Key extends keyof Events>(type: Key, param: Events[Key])=>void
  off:<Key extends keyof Events>(type: Key, handler?: (arg: Events[Key]) => void)=> void 

//热更新时，移除副作用
  onUnmount:(cb: () => void)=>void

}
```


## http模块

这样可以更方便获取上下文
```ts
class HttpBase extends ServerBase {
   context: Ctx
}


//使用案例
@Controller('/user')
class UserController extends HttpBase {

  @Get('/')
  async info() {
   const {user}= this.context
  }
}

```