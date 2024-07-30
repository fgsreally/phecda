# api
```ts 
declare const emitter: PhecdaEmitter// mitt实例
declare function defaultWebInject(): void// 实现Watcher、Storage

declare function wait(...instances: InstanceType<Construct>[]): Promise<any[]>// 等待实例的`Init`完成
// 以下都是命名空间，存储phecda实例
declare const phecdaNamespace: Map<string, WebPhecda>
declare function setDefaultPhecda(namespace: string, phecda: WebPhecda): void
declare function getDefaultPhecda(namespace: string): WebPhecda | undefined
declare function delDefaultPhecda(namespace: string): boolean

declare function bindMethod(instance: any, wrapper?: (instance: any, key: PropertyKey) => Function): any// 处理类实例上的方法
/**
 * WebPhecda 内部方法执行时，会触发一些事件，即内部事件
 */
interface InternalEvents {
  Instantiate: {
    tag: PropertyKey
  }
  Reset: {
    tag: PropertyKey
  }
  Initialize: {
    tag: PropertyKey
  }
  Patch: {
    tag: PropertyKey
    data: any
  }
  Synonym: {
    tag: PropertyKey
  }
  Hmr: {
    tag: PropertyKey
  }
  Unmount: {
    tag: PropertyKey
  }
  Load: {
    data: any
  }
  [key: string | symbol]: any
}
declare class WebPhecda {// 不直接使用，根据不同的框架继承出不同的类
  protected namespace: string
  protected parseModule: <Instance = any>(instance: Instance) => Instance// 处理实例

  memory: Record<string, any>// ssr
  state: Record<string | symbol, any>// 存储实例
  modelMap: WeakMap<object, any>// 存储原始的类
  emitter: mitt.Emitter<InternalEvents>
  constructor(namespace: string, parseModule: <Instance = any>(instance: Instance) => Instance)
  private then

  init<Model extends Construct>(model: Model): InstanceType<Model>// 初始化模块，如果已经初始化过则直接返回
  patch<Model extends Construct>(model: Model, data: DeepPartial<InstanceType<Model>>): void// patch 更改实例
  wait(...modelOrTag: (Construct | PropertyKey)[]): Promise<any[]>// 等待对应模块完成Init
  get<Model extends Construct>(modelOrTag: Model | PropertyKey): InstanceType<Model>// 获取模块实例
  getModel(tag: PropertyKey): Construct// 获取类model
  reset<Model extends Construct>(model: Model): InstanceType<Model> | undefined// 重置模块实例
  unmount(modelOrTag: Construct | PropertyKey): Promise<void>// 卸载模块实例
  unmountAll(): Promise<void[]>
  has(modelOrTag: Construct | PropertyKey): boolean
  // ssr
  serialize(): string
  load(str: string): void
  emit<Key extends keyof InternalEvents>(type: Key, event?: InternalEvents[Key]): void
  on<Key extends keyof InternalEvents>(type: Key, handler: Handler<InternalEvents[Key]>): void
  on(type: '*', handler: WildcardHandler<InternalEvents>): void
}

declare class WebBase extends Base {
  emitter: PhecdaEmitter
}

export { type DeepPartial, type PhecdaEmitter, WebBase, WebPhecda, bindMethod, defaultWebInject, delDefaultPhecda, emitter, getDefaultPhecda, phecdaNamespace, setDefaultPhecda, wait }
```