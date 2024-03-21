/* eslint-disable new-cap */
import type { UnwrapNestedRefs } from 'vue'
import { onBeforeUnmount, reactive, shallowReactive, toRaw, toRef } from 'vue'

import type { Construct, Events } from 'phecda-web'
import { emitter, getActiveInstance, getHandler, getTag, invokeHandler, wrapError } from 'phecda-web'
import type { ReplaceInstanceValues } from './types'
import type { DeepPartial } from './utils'
import { createSharedReactive, mergeReactiveObjects } from './utils'

const REF_SYMBOL = Symbol('ref')
const REACTIVE_SYMBOL = Symbol('reactive')

export function useO<T extends Construct>(module: T): UnwrapNestedRefs<InstanceType<T>> {
  const { state, origin } = getActiveInstance()

  const proxyFn = module.prototype.__SHALLOW__ ? shallowReactive : reactive

  if (module.prototype.__ISOLATE__) {
    const instance = proxyFn(new module())
    instance._promise = invokeHandler('init', instance)
    return instance
  }
  const tag = getTag(module)
  if (!(tag in state)) {
    const instance = proxyFn(new module())

    instance._promise = invokeHandler('init', instance)

    state[tag] = instance

    origin.set(instance, module)
  }

  // it will cause hmr warn repeatly
  // else {
  //   if (origin.get(state[tag]) !== module)
  //     console.warn(`Synonym module: Module taged "${String(tag)}" has been loaded before, so won't load Module "${module.name}"`)
  // }
  return state[tag]
}

export function useRaw<T extends Construct>(module: T) {
  return toRaw(useO(module)) as unknown as InstanceType<T>
}
// like what pinia does
export function usePatch<T extends Construct>(module: T, Data: DeepPartial<InstanceType<T>>) {
  const instance = useO(module)
  mergeReactiveObjects(instance, Data)
}

export function useR<T extends Construct>(module: T): UnwrapNestedRefs<InstanceType<T>> {
  const { cache: cacheMap } = getActiveInstance()
  const instance = useO(module)

  const cache = cacheMap.get(instance) || {}

  if (cache[REACTIVE_SYMBOL])
    return cache[REACTIVE_SYMBOL]

  const proxy = new Proxy(instance, {
    get(target: any, key) {
      if (typeof target[key] === 'function') {
        if (cache[key])
          return cache[key]
        const errorHandler = getHandler(target, key).find((item: any) => item.error)?.error
        if (!errorHandler)
          return target[key].bind(target)
        const wrapper = wrapError(target, key, errorHandler)
        cache[key] = wrapper
        return wrapper
      }

      return target[key]
    },
    set(target: any, key, v) {
      target[key] = v
      return true
    },
  })

  cache[REACTIVE_SYMBOL] = proxy
  if (!cacheMap.has(instance))
    cacheMap.set(instance, cache)
  return proxy
}

export function useV<T extends Construct>(module: T): ReplaceInstanceValues<InstanceType<T>> {
  const { cache: cacheMap } = getActiveInstance()
  const instance = useO(module)
  const cache = cacheMap.get(instance) || {}

  if (cache[REF_SYMBOL])
    return cache[REF_SYMBOL]
  const proxy = new Proxy(instance, {
    get(target: any, key) {
      if (typeof target[key] === 'function') {
        if (cache[key])
          return cache[key]
        const errorHandler = getHandler(target, key).find((item: any) => item.error)?.error
        if (!errorHandler)
          return target[key].bind(target)
        const wrapper = wrapError(target, key, errorHandler)
        cache[key] = wrapper
        return wrapper
      }
      if (target[key]?.__v_skip)
        return target[key]

      const cacheRef = cache[key]
      if (cacheRef && cacheRef.r)// 防止一个属性一开始是函数，后来是非函数的特殊情况
        return cacheRef()

      cache[key] = createSharedReactive(() => {
        return toRef(target, key)
      })
      return cache[key]()
    },
    set() { // readonly
      return false
    },
  })
  cache[REF_SYMBOL] = proxy
  if (!cacheMap.has(instance))
    cacheMap.set(instance, cache)
  return proxy
}
export function useEvent<Key extends keyof Events>(eventName: Key, cb: (event: Events[Key]) => void) {
  onBeforeUnmount(() => {
    emitter.off(eventName, cb)
  })
  emitter.on(eventName, cb)

  return {
    emit: (arg: Events[Key]) => emitter.emit(eventName, arg),
    cancel: () => emitter.off(eventName, cb),
  }
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

// export function cloneV<Instance extends Object>(instance: Instance): Instance {
//   const newInstance: any = {}
//   for (const key in instance) {
//     // eslint-disable-next-line no-prototype-builtins
//     if (instance.hasOwnProperty(key))
//       newInstance[key] = instance[key]
//   }
//   return newInstance
// }
