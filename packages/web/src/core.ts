/* eslint-disable new-cap */
import { get, getTag, invokeHandler } from 'phecda-core'
import type { Construct } from 'phecda-core'
import 'reflect-metadata'
import mitt, { Handler, WildcardHandler } from 'mitt'
import { defaultWebInject } from './inject'
import { DeepPartial } from './types'
import { deepMerge } from './utils'

export function wait(...instances: InstanceType<Construct>[]) {
  return Promise.all(instances.map(i => i.__PROMISE_SYMBOL__))
}

function getParamtypes(Model: Construct, key?: string | symbol) {
  return Reflect.getMetadata('design:paramtypes', Model, key!)
}

export const phecdaNamespace = new Map<string, WebPhecda>()

export function setDefaultPhecda(namespace: string, phecda: WebPhecda) {
  phecdaNamespace.set(namespace, phecda)
}
/**
 * for cases that not in ssr
 */
export function getDefaultPhecda(namespace: string) {
  return phecdaNamespace.get(namespace)
}

export function delDefaultPhecda(namespace: string) {
  return phecdaNamespace.delete(namespace)
}

const bindCache = new WeakMap()

export function bindMethod(instance: any, wrapper?: (instance: any, key: PropertyKey) => Function) {
  if (!bindCache.has(instance)) {
    const cache = new WeakMap()
    bindCache.set(instance, new Proxy(instance, {
      get(target, p) {
        if (typeof target[p] === 'function' && p !== 'constructor' && !target[p].toString().startsWith('(')) {
          if (!cache.has(target[p]))
            cache.set(target[p], wrapper ? wrapper(target, p) : target[p].bind(target))

          return cache.get(target[p])
        }

        return target[p]
      },

    }))
  }
  return bindCache.get(instance)
}

interface InternalEvents {
  Instantiate: { tag: PropertyKey }
  Reset: { tag: PropertyKey }
  Initialize: { tag: PropertyKey }
  Patch: { tag: PropertyKey; data: any }
  Synonym: { tag: PropertyKey }
  Hmr: { tag: PropertyKey }
  Unmount: { tag: PropertyKey }
  Load: { data: any }
  [key: string | symbol]: any
}

export class WebPhecda {
  /**
   * for ssr or manual inject
   */
  memory: Record<string, any> = {}
  state: Record<string | symbol, any> = {}
  modelMap = new WeakMap()
  emitter = mitt<InternalEvents>()

  constructor(
    protected namespace: string,
    protected parseModule: <Instance = any>(instance: Instance) => Instance,
  ) {
    if (typeof window !== 'undefined') {
      defaultWebInject()
      setDefaultPhecda(namespace, this)
    }
  }

  private then<TResult1 = this, TResult2 = never>(
    onfulfilled?: ((value: Omit<this, 'then'>) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ): this {
    const then = this.then
    // @todo it's a bad solution
    // @ts-expect-error just a trick
    this.then = undefined
    wait(...Object.values(this.state)).then(() => onfulfilled?.(this), onrejected).then(() => {
      this.then = then
    })
    return this
  }

  /**
 *   Initialize a module that has not been created yet, and return it directly if it is cached.
 */
  init<Model extends Construct>(model: Model): InstanceType<Model> {
    const tag = getTag(model)

    const initModel = () => {
      const paramtypes = getParamtypes(model) as Construct[]
      let instance: InstanceType<Construct>

      this.emit('Instantiate', { tag })
      if (paramtypes) {
        const paramtypesInstances = [] as any[]
        for (const i in paramtypes)
          paramtypesInstances[i] = this.init(paramtypes[i])

        instance = this.parseModule(new model(...paramtypesInstances))
      }
      else {
        instance = this.parseModule(new model())
      }

      if (tag in this.memory)
        Object.assign(instance, this.memory[tag as string])

      if (typeof window !== 'undefined') {
        this.emit('Initialize', { tag })
        instance.__PROMISE_SYMBOL__ = invokeHandler('init', instance)
      }
      return instance
    }

    const { state, modelMap: map } = this

    if (get(model.prototype, 'isolate'))
      return initModel()

    if (tag in state) {
      if (process.env.NODE_ENV === 'development') { // HMR
        if (map.get(state[tag]) === model)
          return state[tag]
        else this.emit('Hmr', { tag })
      }
      else {
        if (map.get(state[tag]) !== model) {
          this.emit('Synonym', { tag })

          console.warn(`Synonym model: Module taged "${String(tag)}" has been loaded before, so won't load Module "${model.name}"`)
        }

        return state[tag]
      }
    }

    const instance = initModel()

    state[tag] = instance

    map.set(instance, model)
    return instance
  }

  patch<Model extends Construct>(model: Model, data: DeepPartial<InstanceType<Model>>) {
    const tag = getTag(model)
    const { state } = this
    this.emit('Patch', { tag, data })
    deepMerge(state[tag], data)
  }

  wait(...modelOrTag: (Construct | PropertyKey)[]) {
    return Promise.all(modelOrTag.map((i) => {
      if (typeof i === 'function')
        i = getTag(i)

      return this.get(i).__PROMISE_SYMBOL__
    }))
  }

  get<Model extends Construct>(modelOrTag: Model | PropertyKey): InstanceType<Model> {
    const { state } = this
    const tag = typeof modelOrTag === 'function' ? getTag(modelOrTag) : modelOrTag
    return state[tag]
  }

  getModel(tag: PropertyKey): Construct {
    const { state } = this

    return this.modelMap.get(state[tag])
  }

  reset<Model extends Construct>(model: Model) {
    const { state } = this
    const tag = getTag(model)
    if (!(tag in state))
      return this.init(model)

    this.emit('Reset', { tag })

    const instance = this.init(model)
    const newInstance = new model()
    Object.assign(instance, newInstance)
    // delete other property
    for (const key in instance) {
      if (!(key in newInstance))
        delete instance[key]
    }
  }

  async unmount(modelOrTag: Construct | PropertyKey) {
    const tag = typeof modelOrTag === 'function' ? getTag(modelOrTag) : modelOrTag

    if (!this.has(tag))
      return

    this.emit('Unmount', { tag })

    const { state } = this
    await invokeHandler('unmount', this.get(tag))
    delete state[tag]
  }

  async unmountAll() {
    const { state } = this

    return Promise.all(Object.keys(state).map(tag => this.unmount(tag)))
  }

  has(modelOrTag: Construct | PropertyKey) {
    const { state } = this
    const tag = typeof modelOrTag === 'function' ? getTag(modelOrTag) : modelOrTag

    if (tag in state)

      return true

    return false
  }

  serialize() {
    const { state } = this

    return JSON.stringify(state, (_key, value) => {
      if (this.modelMap.has(value))
        return null
    })
  }

  load(str: string) {
    const state = JSON.parse(str)

    this.emit('Load', { data: state })

    for (const tag in state) {
      if (tag in this.state)
        Object.assign(this.state[tag], state[tag])

      else
        this.memory[tag] = state[tag]
    }
  }

  emit<Key extends keyof InternalEvents>(type: Key, event?: InternalEvents[Key]) {
    this.emitter.emit(type, event)
  }

  on<Key extends keyof InternalEvents>(type: Key, handler: Handler<InternalEvents[Key]>): void
  on(type: '*', handler: WildcardHandler<InternalEvents>): void
  on(type: '*', handler: WildcardHandler<InternalEvents>) {
    this.emitter.on(type, handler)
  }
}
