/* eslint-disable new-cap */
import { proxy, useSnapshot } from 'valtio'
import type { Construct, Events, Plugin } from 'phecda-web'
import { useEffect } from 'react'
import { getActiveInstance, getHandler, getTag, registerSerial, resetActiveInstance, wrapError } from 'phecda-web'

export function useO<T extends Construct>(module: T) {
  const { state, _o: oMap } = getActiveInstance()
  if (module.prototype.__ISOLATE__) {
    const instance = new module()

    return instance
  }

  const tag = getTag(module)

  if (tag in state) {
    if (oMap.get(state[tag]) !== module)
      console.warn(`Synonym module: Module taged "${String(tag)}" has been loaded before, so won't load Module "${module.name}"`)

    return state[tag]
  }
  const instance = new module()

  state[tag] = instance
  return instance
}

export function useR<T extends Construct>(module: T): [InstanceType<T>, InstanceType<T>] {
  const { _r: rmap, _f: fmap } = getActiveInstance()
  const instance = useO(module)
  if (rmap.has(instance)) {
    const proxyInstance = rmap.get(instance)
    return [useSnapshot(proxyInstance), proxyInstance]
  }

  const proxyInstance = proxy(new Proxy(instance, {
    get(target: any, key) {
      if (key === '_promise')
        return target[key]
      if (typeof target[key] === 'function') {
        if (fmap.has(target[key]))
          return fmap.get(target[key])
        const errorHandler = getHandler(target, key).find((item: any) => item.error)?.error
        if (!errorHandler)
          return target[key].bind(target)
        const wrapper = wrapError(target, key, errorHandler)
        fmap.set(target[key], wrapper)
        return wrapper
      }

      return target[key]
    },
    set(target: any, key, v) {
      target[key] = v
      return true
    },
  }))

  instance._promise = registerSerial(proxyInstance)

  rmap.set(instance, proxyInstance)

  return [useSnapshot(proxyInstance), proxyInstance]
}
export function createPhecda() {
  resetActiveInstance()
  const instance = getActiveInstance()
  const pluginSet: Plugin[] = []
  return {
    use(...plugins: Plugin[]) {
      plugins.forEach((p) => {
        p.setup(instance)
        pluginSet.push(p)
      })
    },
    load(state: any) {
      instance.state = state
      return this
    },

    unmount() {
      pluginSet.forEach(p => p.unmount?.(instance))
    },

  }
}

export function useEvent<Key extends keyof Events>(eventName: Key, cb: (event: Events[Key]) => void) {
  useEffect(() => {
    return () => emitter.off(eventName, cb)
  })

  emitter.on(eventName, cb)

  return [
    (arg: Events[Key]) => emitter.emit(eventName, arg),
    () => emitter.off(eventName, cb),
  ]
}

export function initialize<M extends Construct>(module: M, deleteOtherProperty = true): InstanceType<M> | void {
  const instance = useO(module)
  const newInstance = new module()
  Object.assign(instance, newInstance)
  if (deleteOtherProperty) {
    for (const key in instance) {
      if (!(key in newInstance))
        delete instance[key]
    }
  }
}
