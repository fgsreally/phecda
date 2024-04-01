# 核心装饰器
分为两种，

一种是已完成的
一种是未完成的，需要后续去实现

## 完成的

```ts
// 基本的
// 初始化时执行该方法
declare function Init(proto: any, key: PropertyKey): void
// 卸载时执行该方法
declare function Unmount(proto: any, key: PropertyKey): void
// 方法上绑定数据
declare function Bind(value: any): (proto: any, k: PropertyKey) => void
// 忽略
declare function Ignore(proto: any, key: PropertyKey): void
// 清除其上所有装饰器的效果
declare function Clear(proto: any, key: PropertyKey): void
// 暴露
declare function Expose(proto: any, key: PropertyKey): void

declare function Empty(module: any): void
// 带功能的
declare function Isolate(target: any): void
declare function Tag(tag: PropertyKey): (module: any) => void
declare function Unique(desc?: string): (module: any) => void
declare function Assign(cb: (instance?: any) => any): (module: any) => void
declare function Global(module: any): void
declare function To(...callbacks: ((arg: any, instance: any, key: string) => any)[]): (proto: any, key: PropertyKey) => void
declare function Rule(cb: ((arg: any) => boolean | Promise<boolean>), info: string | (() => string)): (proto: any, key: PropertyKey) => void
declare function Err(cb: (e: Error | any, instance: any, key: string) => void, isCatch?: boolean): (proto: any, key: PropertyKey) => void
```