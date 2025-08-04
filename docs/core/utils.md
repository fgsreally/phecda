# 工具

## 常用函数
非常常用，非常重要，用于继承
```ts
// 获得一个新的model ，移除了指定属性（包括其元数据）
declare function omit<Class extends Construct, Key extends keyof InstanceType<Class>>(classFn: Class, ...properties: Key[]): Construct<Omit<InstanceType<Class>, Key>>;
// 获得一个新的model ，保留了指定属性（包括其元数据）
declare function pick<Class extends Construct, Key extends keyof InstanceType<Class>>(classFn: Class, ...properties: Key[]): Construct<Pick<InstanceType<Class>, Key>>;
// 获得一个新的model ，让指定属性元数据的required 设为false，如果没有指定属性，那就是全部属性
declare function partial<Class extends Construct>(classFn: Class): Construct<Partial<InstanceType<Class>>>;
declare function partial<Class extends Construct, Key extends keyof InstanceType<Class>>(classFn: Class, ...properties: Key[]): Construct<Partial<Pick<InstanceType<Class>, Key>> & Omit<InstanceType<Class>, Key>>;
//仅仅是个类型辅助，不做任何事情，当需要更改一个属性的类型定义时
declare function override<Class extends Construct, Key extends keyof InstanceType<Class>>(classFn: Class, ...properties: Key[]): Construct<Omit<InstanceType<Class>, Key>>;


```



## 内部函数
> 主要使用模式就是在装饰器中，将元数据挂载到`model`上，后续进行消费
主要是操作元数据相关，一般不直接在业务中使用

```ts
// 属性上注册状态
declare function setMeta(
  proto: Phecda,
  key: PropertyKey | undefined,
  index: number | undefined,
  meta: Record<string, any>
): void
// 从实例/类/原型，获取元数据所在的载体，
declare function getPhecdaFromTarget(target: any): any;
// 获得model上所有设置了元数据的属性（不包括父类）
declare function getOwnMetaKeys(target: any): string[]
// 包括父类
declare function getMetaKeys(target: any): PropertyKey[]
// 获取指定方法上所有设置了元数据的函数参数（不包括父类）
declare function getOwnMetaParams(target: any, key?: PropertyKey): number[];
// 包括父类
declare function getMetaParams(target: any, key?: PropertyKey): number[];
// 获得类上属性/参数注册的元数据记录，是一个数组（不包括父类）
declare function getOwnMeta(target: any, key: PropertyKey, index?: number): any[]
// 包括父类
declare function getMeta(target: any, key: PropertyKey | undefined, index?: number): any[]

// 获取元数据（将元数据记录合并为一个对象）
declare function getMergedMeta(target: any, property?: PropertyKey, index?: number, merger?: (prev: any, cur: any) => any): any

// 类上添加/获取属性
declare function set(proto: any, key: string, value: any): void
declare function get(proto: any, key: string): any
// 执行模块上的事件
declare function invoke(instance: Phecda, event: string): Promise<any[]>
// invoke(instance,'init')
declare function invokeInit(instance: any): Promise<PromiseSettledResult<any>[]>
// invoke(instance,'unmount')
declare function invokeUnmount(instance: any): Promise<PromiseSettledResult<any>[]>
// 注入与获取（用于实现phecda-core未实现的装饰器）
declare function setInject(key: string, value: any): Record<string, any>
declare function getInject(key: string): any
```

## 辅助函数


业务中会有使用

```ts


// 判断是否是被phecda装饰器装饰过的类,即是否是个model
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

// 获得模块的tag,有Tag修饰时，即返回Tag的值，否则返回类名
declare function getTag<M extends Construct | AbConstruct>(
  moduleOrInstance: M | InstanceType<M>
): PropertyKey
// 等待init 事件完成
declare function wait(...instances: InstanceType<Construct>[]): Promise<any[]>;
// 对象转为类
declare function objectToClass<Obj extends Record<string, any>>(obj: Obj): new () => Obj;
//函数转为类
declare function functionToClass<Func extends (...args: any) => object>(fn: Func): new (...args: Parameters<Func>) => ReturnType<Func>;
```

## 辅助类
和[未实现装饰器](./decorator.md#未实现)有点像，需要通过子类实现功能

其实就是把一些常用的功能，如`事件总线/初始化`集中到一个类上，然后模块直接继承，就可以不使用那么多装饰器或辅助函数了
 ```ts

declare abstract class Base {
    private readonly __UNMOUNT_SYMBOL__;
    private readonly __PROMISE_SYMBOL__;
    abstract emitter: any;
    constructor();
    get tag(): PropertyKey;
    protected init(): void;
    protected then(cb: () => void, reject?: (e: any) => void): Promise<void>;
    on<Key extends keyof Events>(type: Key, handler: (arg: Events[Key]) => void): void;
    emit<Key extends keyof Events>(type: Key, param: Events[Key]): void;
    off<Key extends keyof Events>(type: Key, handler?: (arg: Events[Key]) => void): void;
    protected onUnmount(cb: () => void): void;
    private _unmount;
}

 ```