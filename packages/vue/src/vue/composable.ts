/* eslint-disable new-cap */
import type { Handler } from 'mitt'
import type { UnwrapNestedRefs } from 'vue'
import { onBeforeUnmount, reactive, toRaw, toRef } from 'vue'
import type { Construct, Events } from 'phecda-core'
import { Init, getHandler, getTag, registerAsync } from 'phecda-core'
import { emitter } from '../emitter'
import type { ReplaceInstanceValues } from '../types'
import { getActivePhecda } from './phecda'
import type { DeepPartial } from './utils'
import { createSharedReactive, mergeReactiveObjects, wrapError } from './utils'

export function useO<T extends Construct>(module: T): UnwrapNestedRefs<InstanceType<T>> {
  const { useOMap } = getActivePhecda()
  const tag = getTag(module) || module.name
  if (!useOMap.has(tag)) {
    const instance = reactive(new module())
    useOMap.set(tag, instance)
    instance._promise = registerAsync(instance)
  }
  return useOMap.get(tag)
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
  const { useRMap, fnMap } = getActivePhecda()
  const instance = useO(module)

  if (useRMap.has(instance))
    return useRMap.get(instance)
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

  useRMap.set(instance, proxy)
  return proxy
}

export function useV<T extends Construct>(module: T): ReplaceInstanceValues<InstanceType<T>> {
  const { useVMap, fnMap, computedMap } = getActivePhecda()
  const instance = useO(module)

  if (useVMap.has(instance))
    return useVMap.get(instance)
  computedMap.set(instance, {})
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
      const cache = computedMap.get(instance)
      if (key in cache)
        return cache[key]()

      cache[key] = createSharedReactive(() => {
        return toRef(target, key)
      })
      return cache[key]()
    },
    set() { // readonly
      return false
    },
  })

  useVMap.set(instance, proxy)
  return proxy
}
export function useEvent<Key extends keyof Events>(eventName: Key, cb: Handler<Events[Key]>) {
  onBeforeUnmount(() => {
    emitter.off(eventName, cb)
  })
  emitter.on(eventName, cb)

  return () => emitter.off(eventName, cb)
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

export async function waitUntilInit(...modules: Construct[]) {
  await Promise.all(modules.map(m => useO(m)._promise))
}
