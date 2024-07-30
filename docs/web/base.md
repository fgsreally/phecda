# 基础示例
 基于`phecda-web`的，无论`phecda-vue/react`都支持以下写法

 ```ts
@Storage('home')// 将实例数据存储到localstorage
// @Isolate 如果设置了，那么就不再是单例，每次useR都会产生新的实例，用于弹窗等功能
class Home {
   name: string
   constructor(protected about: About/** 依赖注入 */) {
     this.about = getR(About)// 如果没使用ts元数据，需要写这一行，或者在方法中用到了再getR
   }
 
   @Init
   init() {
     this.name = 'home'
   }

   @Err(errorHandler)
   throw() {
     throw new Error('invoke error Handler')
   }

   @Watcher('changeName')
   watch(name: string) {
     console.log(name)// name
   }
}
// ...
emitter.emit('changeName', 'name') // 触发 changeName事件
```

