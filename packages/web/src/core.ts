/* eslint-disable new-cap */
import { get, getTag, invokeHandler } from 'phecda-core'
import type { Construct } from 'phecda-core'

import 'reflect-metadata'
import { defaultWebInject } from './inject'
import { DeepPartial } from './types'
import { deepMerge } from './utils'

export function wait(...instances: InstanceType<Construct>[]) {
  return Promise.all(instances.map(i => i._promise))
}

function getParamtypes(Model: Construct, key?: string | symbol) {
  return Reflect.getMetadata('design:paramtypes', Model, key!)
}

let defaultPhecda: WebPhecda

export function setDefaultPhecda(phecda: WebPhecda) {
  defaultPhecda = phecda
}
// for cases that not in ssr
export function getDefaultPhecda() {
  return defaultPhecda
}

const bindCache = new WeakMap()

export function bindMethod(instance: any) {
  if (!bindCache.has(instance)) {
    const cache = new WeakMap()
    bindCache.set(instance, new Proxy(instance, {
      get(target, p) {
        if (typeof target[p] === 'function' && !target[p].toString().startsWith('(')) {
          if (!cache.has(target[p]))
            cache.set(target[p], target[p].bind(target))

          return cache.get(target[p])
        }
        return target[p]
      },
    }))
  }
  return bindCache.get(instance)
}

export class WebPhecda {
  origin: Record<string, any> = {}
  state: Record<string | symbol, any> = {}
  modelMap = new WeakMap()
  constructor(
    protected parseModule: <Instance = any>(instance: Instance) => Instance,
  ) {
    if (typeof window !== 'undefined') {
      defaultWebInject()
      setDefaultPhecda(this)
    }
  }

  // Initialize a module that has not been created yet, and return it directly if it is cached.
  init<Model extends Construct>(model: Model): InstanceType<Model> {
    const tag = getTag(model)

    const initModel = () => {
      const paramtypes = getParamtypes(model) as Construct[]
      let instance: InstanceType<Construct>
      if (paramtypes) {
        const paramtypesInstances = [] as any[]
        for (const i in paramtypes)
          paramtypesInstances[i] = this.init(paramtypes[i])

        instance = this.parseModule(new model(...paramtypesInstances))
      }
      else {
        instance = this.parseModule(new model())
      }

      if (tag in this.origin) {
        Object.assign(instance, this.origin[tag as string])
        delete this.origin[tag as string]
      }
      if (typeof window !== 'undefined')
        instance._promise = invokeHandler('init', instance)
      return instance
    }

    const { state, modelMap: map } = this

    if (get(model.prototype, 'isolate'))
      return initModel()

    if (tag in state) {
      if (process.env.NODE_ENV === 'development') { // HMR
        if (map.get(state[tag]) === model)
          return state[tag]
      }
      else {
        if (map.get(state[tag]) !== model)
          console.warn(`Synonym model: Module taged "${String(tag)}" has been loaded before, so won't load Module "${model.name}"`)
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

    deepMerge(state[tag], data)
  }

  wait(...modelOrTag: (Construct | PropertyKey)[]) {
    const { state } = this

    return Promise.all(modelOrTag.map((i) => {
      if (typeof i === 'function')
        i = getTag(i)

      return state[i]._promise
    }))
  }

  get<Model extends Construct>(model: Model): InstanceType<Model> {
    const { state } = this

    return state[getTag(model)]
  }

  has<Model extends Construct>(model: Model): boolean {
    const { state } = this

    return getTag(model) in state
  }

  reset<Model extends Construct>(model: Model) {
    const { state } = this
    const tag = getTag(model)
    if (!(tag in state))
      return this.init(model)

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
    const { state } = this
    await invokeHandler('unmount', state[tag])
    delete state[tag]
  }

  async unmountAll() {
    const { state } = this

    return Promise.all(Object.keys(state).map(tag => this.unmount(tag)))
  }

  ismount(modelOrTag: Construct | PropertyKey) {
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
    this.origin = JSON.parse(str)
  }
}
