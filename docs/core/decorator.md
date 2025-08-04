# 装饰器

## 基础装饰器

```ts
// 基本的
// 初始化时执行该方法
declare function Init(proto: any, key: PropertyKey): void
// 卸载时执行该方法
declare function Unmount(proto: any, key: PropertyKey): void
// 清除该属性上之前所有装饰器的效果
declare function Clear(proto: any, key: PropertyKey): void
// 暴露，本身不做任何事情，只是让这个属性受phecda-core控制
declare function Expose(proto: any, key: PropertyKey): void
// 同上，用在类上而非属性上，让类受phecda-core控制
declare function Empty(module: any): void
declare function Injectable(): (target: any) => void;//Empty的别称
//为类/属性/参数添加文档说明
declare function Doc(doc: string): (target: any, property: PropertyKey, index?: any) => void;
// 打上标识
declare function Tag(tag: PropertyKey): (module: any) => void
// 打上symbol标识，唯一标识
declare function Unique(desc?: string): (module: any) => void

// 类似Object.assign，初始化时执行
declare function Assign(cb: (instance?: any) => any): (module: any) => void
// 绑定到全局 globalThis.__PHECDA__[tag] (tag 是 getTag 的返回值)
declare function Global(module: any): void
// 错误处理
declare function Err(cb: (e: Error | any, instance: any, key: string) => void, isCatch?: boolean): (proto: any, key: PropertyKey) => void
// 数据修改时副作用
declare function Effect(cb: (value: any, instance: any, key: string) => void): (proto: any, key: string) => void
```
## 未实现
需要其他包去实现，和前面的装饰器的区别是：这些装饰器有可能不会实现

比如在服务端中`Storage`没有什么意义，那么就什么都不会发生，而客户端中就可以读取/存入`localstorage`
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

// 一般来讲，模块是单例的，一个model对应一个module，
// Isolate来标识该模块是多例的，每次创建都是创建一个新的模块
declare function Isolate(target: any): void
```


## 验证装饰器
```ts
//自定义验证，可以用在类/属性/参数上，其他的只能用在属性/参数上
declare function Rule(...rules: ((args: RuleArgs) => void | string | any | true | Promise<void | string | any | true>)[]): (target: any, property?: PropertyKey, index?: any) => void;
//必选
declare function Required(target: any, property: PropertyKey, index?: any): void;
//可选
declare function Optional(target: any, property: PropertyKey, index?: any): void;
//可以用于number/string/array，最小/大值或长度
declare function Min(min: number): (target: any, property?: PropertyKey, index?: any) => void;
declare function Max(max: number): (target: any, property?: PropertyKey, index?: any) => void;
// 嵌套子模型
declare function Nested(model: Construct): (target: any, property: string, index?: any) => void;
// 只要满足其中一个条件就行，条件可以是自定义验证，如同Rule，也可以是子模型，如同Nested
declare function OneOf(...validations: (Construct | ((args: RuleArgs) => boolean | Promise<boolean>))[]): (target: any, property: string, index?: any) => void;
// 枚举之一
declare function Enum(map: Record<string, any>): (target: any, property: string, index?: any) => void;
// 常量，固定值
declare function Const(value: string | number | boolean | null | undefined): (target: any, property: string, index?: any) => void;

```




## 辅助装饰器
```ts
// 将多个装饰器合为一个
declare function Pipeline(
  ...decos: ((...args: any) => void)[]
): (...args: any) => void

// 不满足条件则装饰器不添加
declare function If(value: Boolean, ...decorators: (ClassDecorator[]) | (PropertyDecorator[]) | (ParameterDecorator[])): (...args: any[]) => void

```