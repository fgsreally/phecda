# 核心api

如果你不需要实现特别的装饰器，不需要看以下部分

直接看[装饰器](./decorator.md)就行

```ts
// 这个属性是含有数据的
declare function setStateVar(proto: Phecda, key: PropertyKey): void
// 这个属性是暴露的（真正暴露的，还要减去Ignore中的）
declare function setExposeKey(proto: Phecda, key: PropertyKey): void
// 这个属性是被忽略的
declare function setIgnoreKey(proto: Phecda, key: PropertyKey): void
// 属性上注册方法
declare function setHandler(proto: Phecda, key: PropertyKey, handler: Handler): void
// 属性上注册状态
declare function setState(proto: Phecda, key: PropertyKey, state: Record<string, any>): void
// 获得类上所有含数据的属性（不包括父类）
declare function getOwnStateVars(target: any): string[]
// 获得类上所有含数据的属性
declare function getStateVars(target: any): PropertyKey[]
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
// 触发实例上注册的handler
declare function invokeHandler(event: string, instance: Phecda): Promise<any[]>
// 注入与获取
declare function Provide<K extends keyof InjectData>(key: K, value: InjectData[K]): void
declare function Inject<K extends keyof InjectData>(key: K): InjectData[K]
// 注入与获取（用于实现PC未实现的装饰器）
declare function injectProperty(key: string, value: any): Record<string, any>
declare function getProperty(key: string): any
```