import type { Handler } from 'mitt'
import type { UnwrapNestedRefs } from 'vue'
import { computed, getCurrentInstance, inject, onScopeDispose, reactive } from 'vue'
import { getHandler, register } from 'phecda-core'
import { emitter } from '../emitter'
import type { PhecdaEvents, Vret } from '../types'
import { getActivePhecda, phecdaSymbol, setActivePhecda } from './phecda'
import type { _DeepPartial } from './utils'
import { createSharedReactive, mergeReactiveObjects, wrapError } from './utils'

// create/get origin reactive value
export function useO<T extends new (...args: any) => any>(Model: T): UnwrapNestedRefs<InstanceType<T>> {
  if (getCurrentInstance()) {
    const cur = inject(phecdaSymbol, null)
    if (cur)
      setActivePhecda(cur)
  }
  const { useOMap } = getActivePhecda()
  if (!useOMap.has(Model)) {
    const instance = reactive(new Model())
    useOMap.set(Model, instance)
    register(instance)
  }
  return useOMap.get(Model)
}

export function usePatch<T extends new (...args: any) => any>(Model: T, Data: _DeepPartial<InstanceType<T>>) {
  useO(Model)
  const { useOMap } = getActivePhecda()
  const target = useOMap.get(Model)
  mergeReactiveObjects(target, Data)
}

export function useR<T extends new (...args: any) => any>(Model: T): UnwrapNestedRefs<InstanceType<T>> {
  useO(Model)
  const { useRMap, useOMap, fnMap } = getActivePhecda()

  if (useRMap.has(Model))
    return useRMap.get(Model)
  const instance = useOMap.get(Model)
  const proxy = new Proxy(instance, {
    get(target: any, key) {
      if (typeof target[key] === 'function') {
        if (fnMap.has(target[key]))
          return fnMap.get(target[key])
        const errorHandler = getHandler(target, key).find((item: any) => item.error)?.error
        if (!errorHandler)
          return target[key].bind(target)
        const wrapper = wrapError(target, key, errorHandler)
        fnMap.set(target[key], wrapper)
        return wrapper
      }

      return target[key]
    },
    set(target: any, key, v) {
      target[key] = v
      return true
    },
  })

  useRMap.set(Model, proxy)
  return proxy
}

export function useV<T extends new (...args: any) => any>(Model: T): Vret<InstanceType<T>> {
  useO(Model)
  const { useVMap, useOMap, fnMap, computedMap } = getActivePhecda()

  if (useVMap.has(Model))
    return useVMap.get(Model)
  computedMap.set(Model, {})
  const instance = useOMap.get(Model)
  const proxy = new Proxy(instance, {
    get(target: any, key) {
      if (typeof target[key] === 'function') {
        if (fnMap.has(target[key]))
          return fnMap.get(target[key])
        const errorHandler = getHandler(target, key).find((item: any) => item.error)?.error
        if (!errorHandler)
          return target[key].bind(target)
        const wrapper = wrapError(target, key, errorHandler)
        fnMap.set(target[key], wrapper)
        return wrapper
      }
      const cache = computedMap.get(Model)
      if (key in cache)
        return cache[key]()

      cache[key] = createSharedReactive(() => {
        return computed({
          get() {
            return target[key]
          },
          set(v) {
            return target[key] = v
          },
        })
      })

      return cache[key]()
    },
    set() { // readonly
      return false
    },
  })

  useVMap.set(Model, proxy)
  return proxy
}
export function useOn<Key extends keyof PhecdaEvents>(eventName: Key, cb: Handler<PhecdaEvents[Key]>) {
  onScopeDispose(() => {
    emitter.off(eventName, cb)
  })
  emitter.on(eventName, cb)

  return () => emitter.off(eventName, cb)
}

export function initalize<M extends new (...args: any) => any>(Model: M): InstanceType<M> | void {
  const instance = useO(Model)
  if (instance) {
    Object.assign(instance, new Model())
    return instance
  }
}

export function clearStorage<M extends new (...args: any) => any>(Model: M, isForceUpdate = true) {
  localStorage.removeItem(`_phecda_${useO(Model)._symbol}`)
  isForceUpdate && initalize(Model)
}

export function deleteStorage(tag: string) {
  localStorage.removeItem(`_phecda_${tag}`)
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
