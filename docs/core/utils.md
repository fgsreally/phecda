# 工具函数


## 基础部分
以下`api`用于后续其他`Phecda`包的实现，不直接在业务中使用

主体流程就是在装饰器中，通过`setMetaKey`等方法注册

在后续（像`vue`中就是通过`useV`）通过`getMetaKeys`等获取被装饰的属性，以及注册的方法和值，正常消费即可。

```ts
// 属性上注册状态
declare function setMeta(
  proto: Phecda,
  key: PropertyKey | undefined,
  index: number | undefined,
  meta: Record<string, any>
): void
// 获得类上所有含数据的属性（不包括父类）
declare function getOwnMetaKeys(target: any): string[]
// 获得类上所有含数据的属性
declare function getMetaKeys(target: any): PropertyKey[]
// 获得类上注册的元数据
declare function getMeta(target: any, key: PropertyKey | undefined, index?: number): any[]
declare function getOwnMeta(target: any, key: PropertyKey, index?: number): any[]
// 将元数据数组合并成一个对象
declare function getMergedMeta(target: any, property?: PropertyKey, index?: number, merger?: (prev: any, cur: any) => any): any

// 类上添加/获取属性
declare function set(proto: any, key: string, value: any): void
declare function get(proto: any, key: string): any
// 如果对应元数据是函数，执行
declare function invoke(instance: Phecda, event: string): Promise<any[]>
// invoke(instance,'init')
declare function invokeInit(instance: any): Promise<PromiseSettledResult<any>[]>
// invoke(instance,'unmount')
declare function invokeUnmount(instance: any): Promise<PromiseSettledResult<any>[]>
// 注入与获取（用于实现phecda-core未实现的装饰器）
declare function setInject(key: string, value: any): Record<string, any>
declare function getInject(key: string): any
```

# 辅助函数

```ts
// 判断是否是被pc装饰器装饰过的类
declare function isPhecda(model: any): model is Construct
// 注入与获取
declare function Provide<K extends keyof InjectData>(
  key: K,
  value: InjectData[K]
): void
declare function Inject<K extends keyof InjectData>(key: K): InjectData[K]

// 用函数的形式，将装饰器挂载到类上
declare function addDecoToClass<M extends Construct | AbConstruct>(
  c: M,
  key: keyof InstanceType<M> | PropertyKey,
  handler: PropertyDecorator | ClassDecorator
): void

// 将多个装饰器合为一个
declare function Pipeline(
  ...decos: ((...args: any) => void)[]
): (...args: any) => void

// 获得模块的tag,有Tag修饰时，即返回Tag的值，否则返回类名
declare function getTag<M extends Construct | AbConstruct>(
  moduleOrInstance: M | InstanceType<M>
): PropertyKey

// 不满足条件则装饰器不添加
declare function If(value: Boolean, ...decorators: (ClassDecorator[]) | (PropertyDecorator[]) | (ParameterDecorator[])): (...args: any[]) => void
```
