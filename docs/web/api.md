```ts
import { Base, Construct, Events } from 'phecda-core'
import * as mitt from 'mitt'
import { Handler, WildcardHandler } from 'mitt'
export * from 'phecda-core'

declare const emitter: PhecdaEmitter
declare function defaultWebInject(): void

declare function wait(...instances: InstanceType<Construct>[]): Promise<any[]>
declare const phecdaNamespace: Map<string, WebPhecda>
declare function setDefaultPhecda(namespace: string, phecda: WebPhecda): void
/**
 * for cases that not in ssr
 */
declare function getDefaultPhecda(namespace: string): WebPhecda | undefined
declare function delDefaultPhecda(namespace: string): boolean
declare function bindMethod(instance: any, wrapper?: (instance: any, key: PropertyKey) => Function): any
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
declare class WebPhecda {
  protected namespace: string
  protected parseModule: <Instance = any>(instance: Instance) => Instance
  /**
     * for ssr or manual inject
     */
  memory: Record<string, any>
  state: Record<string | symbol, any>
  modelMap: WeakMap<object, any>
  emitter: mitt.Emitter<InternalEvents>
  constructor(namespace: string, parseModule: <Instance = any>(instance: Instance) => Instance)
  private then
  /**
   *   Initialize a module that has not been created yet, and return it directly if it is cached.
   */
  init<Model extends Construct>(model: Model): InstanceType<Model>
  patch<Model extends Construct>(model: Model, data: DeepPartial<InstanceType<Model>>): void
  wait(...modelOrTag: (Construct | PropertyKey)[]): Promise<any[]>
  get<Model extends Construct>(modelOrTag: Model | PropertyKey): InstanceType<Model>
  getModel(tag: PropertyKey): Construct
  reset<Model extends Construct>(model: Model): InstanceType<Model> | undefined
  unmount(modelOrTag: Construct | PropertyKey): Promise<void>
  unmountAll(): Promise<void[]>
  has(modelOrTag: Construct | PropertyKey): boolean
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