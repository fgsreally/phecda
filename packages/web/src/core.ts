/* eslint-disable new-cap */
import { get, getTag, invokeHandler } from 'phecda-core'
import type { Construct } from 'phecda-core'

import 'reflect-metadata'

export function wait(...instances: InstanceType<Construct>[]) {
  return Promise.all(instances.map(i => i._promise))
}

function getParamtypes(Model: Construct, key?: string | symbol) {
  return Reflect.getMetadata('design:paramtypes', Model, key!)
}

export class Core {
  _s: Record<string | symbol, any> = {}
  _m = new WeakMap()
  _c = new WeakMap()
  constructor(
    protected proxyFn: Function,
  ) {

  }

  init(model: Construct) {
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
      instance._promise = invokeHandler('init', instance)
      return instance
    }

    const { _s: state, _m: sourcemap } = this
    const isIsolated = get(model.prototype, 'isolate')

    if (isIsolated)
      return initModel()

    const tag = getTag(model)
    if (tag in state) {
      if (process.env.NODE_ENV === 'development') { // HMR
        if (sourcemap.get(state[tag]) === model)
          return state[tag]
      }
      else {
        if (sourcemap.get(state[tag]) !== model)
          console.warn(`Synonym model: Module taged "${String(tag)}" has been loaded before, so won't load Module "${model.name}"`)
        return state[tag]
      }
    }

    const instance = initModel()

    state[tag] = instance

    sourcemap.set(instance, model)
    return instance
  }

  reset<M extends Construct>(model: M, deleteOtherProperty = true): InstanceType<M> | void {
    const { _s: state } = this

    const tag = getTag(model)
    if (!(tag in state))
      return this.init(model)

    const instance = this.init(model)
    const newInstance = new model()
    Object.assign(instance, newInstance)
    if (deleteOtherProperty) {
      for (const key in instance) {
        if (!(key in newInstance))
          delete instance[key]
      }
    }
  }

  async unmount(tag: PropertyKey) {
    const { _s: state } = this

    await invokeHandler('unmount', state[tag as PropertyKey])
    delete state[tag as PropertyKey]
  }

  async unmountAll() {
    const { _s: state } = this

    return Promise.all(Object.keys(state).map(tag => this.unmount(tag)))
  }

  ismount(tag: PropertyKey) {
    const { _s: state } = this
    if (tag in state)

      return true

    return false
  }

  serializeState() {
    const { _s: state } = this

    return JSON.parse(JSON.stringify(state))
  }
  load(state: Record<string, any>) {
    this._s = state
  }
}
