# 模块作为库使用

如何将一些模块作为依赖，通过`npm`发包，被其他项目使用


## 配置
作为一个依赖，首先需要考虑配置参数传入的情况

由于类上构造函数参数必须为注入的其他类，显然不能在这里写入配置

有很多解决方法，没有固定的要求，推荐使用静态属性

```ts
// 封装时
@Tag('xx')
class XxModule {
  static config: xx// 配置信息

  constructor() {
    // 初始化,操作XxModule.config
  }

  @Init
  private async _init() {
    // 异步初始化,操作XxModule.config
  }
}

// 使用时
xxModule.config = 'xx'
Factory([XxModule])
```

