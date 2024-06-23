/* eslint-disable new-cap */
import { get, getTag, invokeHandler } from 'phecda-core'
import type { Construct } from 'phecda-core'

import 'reflect-metadata'
import { defaultWebInject } from './plugin'
import { DeepPartial } from './types'
import { deepMerge } from './utils'

export function wait(...instances: InstanceType<Construct>[]) {
  return Promise.all(instances.map(i => i._promise))
}

function getParamtypes(Model: Construct, key?: string | symbol) {
  return Reflect.getMetadata('design:paramtypes', Model, key!)
}

export class WebPhecda {
  _o: Record<string, any> = {}
  _s: Record<string | symbol, any> = {}
  _m = new WeakMap()
  constructor(
    protected proxyFn: Function,
  ) {
    defaultWebInject()
  }

  init<Model extends Construct>(model: Model): InstanceType<Model> {
    const tag = getTag(model)

    const initModel = () => {
      const paramtypes = getParamtypes(model) as Construct[]
      let instance: InstanceType<Construct>
      if (paramtypes) {
        const paramtypesInstances = [] as any[]
        for (const i in paramtypes)
          paramtypesInstances[i] = this.init(paramtypes[i])

        instance = this.proxyFn(new model(...paramtypesInstances))
      }
      else {
        instance = this.proxyFn(new model())
      }

      if (tag in this._o) {
        Object.assign(instance, this._o[tag as string])
        delete this._o[tag as string]
      }
      if (typeof window !== 'undefined')
        instance._promise = invokeHandler('init', instance)
      return instance
    }

    const { _s: state, _m: map } = this

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
    const { _s: state } = this

    deepMerge(state[tag], data)
  }

  reset<Model extends Construct>(model: Model): InstanceType<Model> | void {
    const { _s: state } = this
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
    const { _s: state } = this
    await invokeHandler('unmount', state[tag])
    delete state[tag]
  }

  async unmountAll() {
    const { _s: state } = this

    return Promise.all(Object.keys(state).map(tag => this.unmount(tag)))
  }

  ismount(modelOrTag: Construct | PropertyKey) {
    const { _s: state } = this
    const tag = typeof modelOrTag === 'function' ? getTag(modelOrTag) : modelOrTag

    if (tag in state)

      return true

    return false
  }

  serialize() {
    const { _s: state } = this

    return JSON.stringify(state, (_key, value) => {
      if (this._m.has(value))
        return null
    })
  }

  load(str: string) {
    this._o = JSON.parse(str)
  }
}
