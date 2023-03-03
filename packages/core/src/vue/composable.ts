import type { Handler } from 'mitt'
import type { UnwrapNestedRefs } from 'vue'
import { computed, getCurrentInstance, inject, onUnmounted, reactive } from 'vue'
import { getHandler, register } from '../core'
import { emitter } from '../emitter'
import type { PhecdaEvents, Vret } from '../types'
import { getActivePhecda, phecdaSymbol, setActivePhecda } from './phecda'
import type { _DeepPartial } from './utils'
import { mergeReactiveObjects, wrapError } from './utils'

// create/get origin reactive value
export function useO<T extends new (...args: any) => any>(Model: T): UnwrapNestedRefs<InstanceType<T>> {
  if (getCurrentInstance()) {
    const cur = inject(phecdaSymbol, null)
    if (cur)
      setActivePhecda(cur)
  }
  const { uesOMap } = getActivePhecda()
  if (!uesOMap.has(Model)) {
    const instance = reactive(new Model())
    uesOMap.set(Model, instance)
    register(instance)
  }
  return uesOMap.get(Model)
}

export function usePatch<T extends new (...args: any) => any>(Model: T, Data: _DeepPartial<InstanceType<T>>) {
  useO(Model)
  const { uesOMap } = getActivePhecda()
  const target = uesOMap.get(Model)
  mergeReactiveObjects(target, Data)
}

export function useR<T extends new (...args: any) => any>(Model: T): UnwrapNestedRefs<InstanceType<T>> {
  useO(Model)
  const { uesRMap, uesOMap } = getActivePhecda()

  if (uesRMap.has(Model))
    return uesRMap.get(Model)
  const instance = uesOMap.get(Model)
  const proxy = new Proxy(instance, {
    get(target: any, key) {
      if (typeof target[key] === 'function') {
        const errorHandler = getHandler(target, key).find((item: any) => item.error)?.error
        if (!errorHandler)
          return target[key].bind(target)
        return wrapError(target, key, errorHandler)
      }

      return target[key]
    },
    set(target: any, key, v) {
      target[key] = v
      return true
    },
  })

  uesRMap.set(Model, proxy)
  return proxy
}

export function useV<T extends new (...args: any) => any>(Model: T): Vret<InstanceType<T>> {
  useO(Model)
  const { uesVMap, uesOMap } = getActivePhecda()

  if (uesVMap.has(Model))
    return uesVMap.get(Model)

  const instance = uesOMap.get(Model)
  const proxy = new Proxy(instance, {
    get(target: any, key) {
      if (typeof target[key] === 'function') {
        const errorHandler = getHandler(target, key).find((item: any) => item.error)?.error
        if (!errorHandler)
          return target[key].bind(target)
        return wrapError(target, key, errorHandler)
      }

      return computed({
        get() {
          return target[key]
        },
        set(v) {
          return target[key] = v
        },
      })
    },
    set() { // readonly
      return false
    },
  })

  uesVMap.set(Model, proxy)
  return proxy
}
export function useOn<Key extends keyof PhecdaEvents>(eventName: Key, cb: Handler<PhecdaEvents[Key]>) {
  onUnmounted(() => {
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
