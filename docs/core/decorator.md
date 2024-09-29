# 核心装饰器
分为两种，

一种是本身已完成的
一种是未完成的，需要后续去实现

## 完成的

```ts
// 基本的
// 初始化时执行该方法
declare function Init(proto: any, key: PropertyKey): void
// 卸载时执行该方法
declare function Unmount(proto: any, key: PropertyKey): void

// 清除在其之前的装饰器的效果
declare function Clear(proto: any, key: PropertyKey): void
// 暴露
declare function Expose(proto: any, key: PropertyKey): void
// 转化成`Phecda`类，但除此之外不干任何事
declare function Empty(module: any): void
// 带功能的
// 意味着该class的实例不是单例的
declare function Isolate(target: any): void
// 打标记
declare function Tag(tag: PropertyKey): (module: any) => void
declare function Unique(desc?: string): (module: any) => void
// 类似Object.assign
declare function Assign(cb: (instance?: any) => any): (module: any) => void
// 绑定到全局
declare function Global(module: any): void

// 错误处理
declare function Err(cb: (e: Error | any, instance: any, key: string) => void, isCatch?: boolean): (proto: any, key: PropertyKey) => void
// 数据修改时副作用
declare function Effect(cb: (value: any, instance: any, key: string) => void): (proto: any, key: string) => void
```

## 未实现

```ts
// 监视行为
declare function Watcher(eventName: keyof Events, options?: {
  once?: boolean
}): (proto: any, key: string) => void
// 存储
declare function Storage({ key, toJSON, toString }?: {
  toJSON?: (str: string) => any
  toString?: (arg: any) => string
  key?: string
}): (proto: any, property?: PropertyKey) => void
```