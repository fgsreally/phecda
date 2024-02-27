/* eslint-disable new-cap */
import { proxy, useSnapshot } from 'valtio'
import type { Construct } from 'phecda-web'
import { getActiveInstance, getHandler, getTag, register, wrapError } from 'phecda-web'

export function useO<T extends Construct>(module: T) {
  const { state } = getActiveInstance()
  if (module.prototype.__ISOLATE__) {
    const instance = new module()
    instance._promise = registerAsync(instance)
    return instance
  }

  const tag = getTag(module) || module.name

  if (tag in state)
    return state[tag]

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
  register(proxyInstance)
  rmap.set(instance, proxyInstance)

  return [useSnapshot(proxyInstance), proxyInstance]
}
