/* eslint-disable new-cap */
import type { UnwrapNestedRefs } from 'vue'
import { onBeforeUnmount, reactive, toRaw, toRef } from 'vue'

import type { Construct, Events } from 'phecda-web'
import { emitter, getActiveInstance, getHandler, getTag, registerAsync, wrapError } from 'phecda-web'
import type { ReplaceInstanceValues } from './types'
import type { DeepPartial } from './utils'
import { createSharedReactive, mergeReactiveObjects } from './utils'

export function useO<T extends Construct>(module: T): UnwrapNestedRefs<InstanceType<T>> {
  const { state } = getActiveInstance()
  if (module.prototype.__ISOLATE__) {
    const instance = reactive(new module())
    instance._promise = registerAsync(instance)
    return instance
  }
  const tag = getTag(module)
  if (!(tag in state)) {
    const instance = reactive(new module())
    instance._promise = registerAsync(instance)
    state[tag] = instance
  }

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
  const { _r: rmap, _f: fmap } = getActiveInstance()
  const instance = useO(module)

  if (rmap.has(instance))
    return rmap.get(instance)
  const proxy = new Proxy(instance, {
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
  })

  rmap.set(instance, proxy)
  return proxy
}

export function useV<T extends Construct>(module: T): ReplaceInstanceValues<InstanceType<T>> {
  const { _v: vmap, _f: fmap, _c: cmap } = getActiveInstance()
  const instance = useO(module)

  if (vmap.has(instance))
    return vmap.get(instance)
  cmap.set(instance, {})
  const proxy = new Proxy(instance, {
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
      const cache = cmap.get(instance)
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

  vmap.set(instance, proxy)
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
