/* eslint-disable new-cap */
import { proxy, useSnapshot } from 'valtio'
import type { Construct, Events } from 'phecda-web'
import { useEffect } from 'react'
import { getActiveInstance, getHandler, getTag, invokeHandler, resetActiveInstance, wrapError } from 'phecda-web'

export function useO<T extends Construct>(module: T) {
  const { state, origin } = getActiveInstance()
  if (module.prototype.__ISOLATE__) {
    const instance = new module()

    return instance
  }

  const tag = getTag(module)

  if (tag in state) {
    if (origin.get(state[tag]) !== module)
      console.warn(`Synonym module: Module taged "${String(tag)}" has been loaded before, so won't load Module "${module.name}"`)

    return state[tag]
  }
  const instance = new module()

  state[tag] = instance
  return instance
}

export function useR<T extends Construct>(module: T): [InstanceType<T>, InstanceType<T>] {
  const { cache: cacheMap } = getActiveInstance()
  const instance = useO(module)
  if (cacheMap.has(instance)) {
    const proxyInstance = cacheMap.get(instance)
    return [useSnapshot(proxyInstance), proxyInstance]
  }

  const proxyInstance = proxy(new Proxy(instance, {
    get(target: any, key) {
      if (key === '_promise')
        return target[key]
      if (typeof target[key] === 'function') {
        if (cacheMap.has(target[key]))
          return cacheMap.get(target[key])
        const errorHandler = getHandler(target, key).find((item: any) => item.error)?.error
        if (!errorHandler)
          return target[key].bind(target)
        const wrapper = wrapError(target, key, errorHandler)
        cacheMap.set(target[key], wrapper)
        return wrapper
      }

      return target[key]
    },
    set(target: any, key, v) {
      target[key] = v
      return true
    },
  }))

  instance._promise = invokeHandler('init', proxyInstance)

  cacheMap.set(instance, proxyInstance)

  return [useSnapshot(proxyInstance), proxyInstance]
}
export function createPhecda() {
  resetActiveInstance()
  return {

    load(state: any) {
      const instance = getActiveInstance()

      instance.state = state
      return this
    },

    async  unmount() {
      const { state } = getActiveInstance()
      await Object.values(state).map(ins => invokeHandler('unmount', ins))
      resetActiveInstance()
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
