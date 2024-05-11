# 辅助函数
```ts
// 判断是否是被pc装饰器装饰过的类
declare function isPhecda(model: any): model is Construct
// 将实例转换为json
declare function classToPlain<M>(instance: M): ClassValue<M>
// json转实例
declare function plainToClass<M extends Construct, Data extends Record<PropertyKey, any>>(model: M, input: Data): InstanceType<M>

// 注入与获取
declare function Provide<K extends keyof InjectData>(key: K, value: InjectData[K]): void
declare function Inject<K extends keyof InjectData>(key: K): InjectData[K]
// 用函数的形式，将装饰器挂载到类上
declare function addDecoToClass<M extends Construct | AbConstruct>(c: M, key: keyof InstanceType<M> | PropertyKey, handler: PropertyDecorator | ClassDecorator): void
// 将多个装饰器合为一个
declare function Pipeline(...decos: ((...args: any) => void)[]): (...args: any) => void

// 获得模块的tag
declare function getTag<M extends Construct | AbConstruct>(moduleOrInstance: M | InstanceType<M>): PropertyKey

// 获得属性用Bind绑定的值
declare function getBind<M extends Construct | AbConstruct>(model: M): any

// 快照
declare function snapShot<T extends Construct>(data: InstanceType<T>): {
  data: InstanceType<T>
  clear(): void
  apply(): void
}
```

