/* eslint-disable prefer-spread */
import type { UnwrapNestedRefs } from 'vue'
import { computed, getCurrentInstance, inject, onUnmounted, reactive } from 'vue'
import { getHandler } from '../decorators'
import { emitter } from '../emitter'
import { register } from '../model'
import type { Vret } from '../types'
import { isAsyncFunc } from '../utils'
import { getActivePhecda, phecdaSymbol, setActivePhecda } from './phecda'
import type { _DeepPartial } from './utils'
import { mergeReactiveObjects } from './utils'

export function useR<T extends new (...args: any) => any>(Model: T): UnwrapNestedRefs<InstanceType<T>> {
  if (getCurrentInstance()) {
    const cur = inject(phecdaSymbol, null)
    if (cur)
      setActivePhecda(cur)
  }
  const { vMap } = getActivePhecda()
  if (!vMap.has(Model)) {
    const instance = reactive(new Model())
    vMap.set(Model, instance)
    register(instance)
  }
  return vMap.get(Model)
}

export function usePatch<T extends new (...args: any) => any>(Model: T, Data: _DeepPartial<InstanceType<T>>) {
  useR(Model)
  const { vMap } = getActivePhecda()
  const target = vMap.get(Model)
  mergeReactiveObjects(target, Data)
}

// export function useWatch<T extends new (...args: any) => any>(Model: T, Cb: (params: InstanceType<T>) => void) {
//   const instance = useR(Model)
//   const { vInfoMap } = getActivePhecda()

//   const info = vInfoMap.get(Model)
//   const watcher = watch(instance, () => {
//     if (info.isListen)
//       Cb(instance as any)
//   }, { deep: true })

//   onScopeDispose(watcher)
//   return watcher
// }

export function useListen(eventName: Parameters<typeof emitter['on']>[0], cb: Parameters<typeof emitter['on']>[1]) {
  onUnmounted(() => {
    emitter.off(eventName, cb)
  })
  emitter.on(eventName, cb)

  return () => emitter.off(eventName, cb)
}

export function useV<T extends new (...args: any) => any>(Model: T): Vret<InstanceType<T>> {
  useR(Model)
  const { vProxyMap, vMap } = getActivePhecda()

  if (vProxyMap.has(Model))
    return vProxyMap.get(Model)

  const instance = vMap.get(Model)
  const proxy = new Proxy(instance, {
    get(target: any, key) {
      if (typeof target[key] === 'function') {
        const errorHandler = getHandler(target, key).find((item: any) => item.error)?.error
        if (!errorHandler)
          return target[key].bind(target)
        if (isAsyncFunc(target[key])) {
          return (...args: any) => {
            return target[key].apply(target, args).catch(errorHandler)
          }
        }
        else {
          return (...args: any) => {
            try {
              return target[key].apply(target, args)
            }
            catch (e) {
              return errorHandler(e)
            }
          }
        }
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
    set(target: any, key, v) {
      target[key] = v
      return true
    },
  })

  vProxyMap.set(Model, proxy)
  return proxy
}

export function cloneV<Instance extends Object>(instance: Instance): Instance {
  const newInstance: any = {}
  for (const key in instance) {
    // eslint-disable-next-line no-prototype-builtins
    if (instance.hasOwnProperty(key))
      newInstance[key] = instance[key]
  }
  return newInstance
}
export function initalize<M extends new (...args: any) => any>(Model: M): InstanceType<M> | void {
  const instance = useR(Model)
  if (instance) {
    Object.assign(instance, new Model())
    return instance
  }
}
export function clearStorage<M extends new (...args: any) => any>(Model: M, isForceUpdate = true) {
  localStorage.removeItem(`_phecda_${useR(Model)._symbol}`)
  isForceUpdate && initalize(Model)
}

export function deleteStorage(tag: string) {
  localStorage.removeItem(`_phecda_${tag}`)
}
