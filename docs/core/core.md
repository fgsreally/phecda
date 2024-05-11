# 核心api

以下`api`用于后续其他`Phecda`包的实现，不直接在业务中使用

主体流程就是在装饰器中，通过`setStateKey`等方法注册

在后续（像`vue`中就是通过`useV`）通过`getStateKeys`等获取被装饰的属性，以及注册的方法和值，正常消费即可。

```ts
// 这个属性是含有数据的
declare function setStateKey(proto: Phecda, key: PropertyKey): void
// 这个属性是暴露的（真正暴露的，还要减去Ignore中的）
declare function setExposeKey(proto: Phecda, key: PropertyKey): void
// 这个属性是被忽略的
declare function setIgnoreKey(proto: Phecda, key: PropertyKey): void
// 属性上注册方法
declare function setHandler(proto: Phecda, key: PropertyKey, handler: Handler): void
// 属性上注册状态
declare function setState(proto: Phecda, key: PropertyKey, state: Record<string, any>): void
// 获得类上所有含数据的属性（不包括父类）
declare function getOwnStateKeys(target: any): string[]
// 获得类上所有含数据的属性
declare function getStateKeys(target: any): PropertyKey[]
// 获得类上真正暴露的属性（同上）
declare function getOwnExposeKey(target: any): string[]
declare function getExposeKey(target: any): PropertyKey[]
// 获得类上忽略的属性
declare function getOwnIgnoreKey(target: any): string[]
// 获得类上注册的方法（同上）
declare function getOwnHandler(target: any, key: PropertyKey): Handler[]
declare function getHandler(target: any, key: PropertyKey): any[]
// 获得类上注册的状态
declare function getState(target: any, key: PropertyKey): any
declare function getOwnState(target: any, key: PropertyKey): Record<string, any>
// 类上添加/获取属性
declare function set(proto: any, key: string, value: any): void
declare function get(proto: any, key: string): any
// 触发实例上注册的handler
declare function invokeHandler(event: string, instance: Phecda): Promise<any[]>

// 注入与获取（用于实现PC未实现的装饰器）
declare function setInject(key: string, value: any): Record<string, any>
declare function getInject(key: string): any
```

