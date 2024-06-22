import { Construct, type Events, emitter } from 'phecda-web'
import { UnwrapNestedRefs, onBeforeUnmount, toRaw, toRef } from 'vue'
import type { ReplaceInstanceValues } from './types'
import { type DeepPartial, createSharedReactive, mergeReactiveObjects } from './utils'
import { getActiveCore } from './core'

export function useRaw<T extends Construct>(model: T) {
  return toRaw(useR(model)) as unknown as InstanceType<T>
}

// like what pinia does
export function usePatch<T extends Construct>(model: T, Data: DeepPartial<InstanceType<T>>) {
  const instance = useR(model)
  mergeReactiveObjects(instance, Data)
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

// 还原模块

export function useR<T extends Construct>(model: T): UnwrapNestedRefs<InstanceType<T>> {
  return getActiveCore().init(model)
}

const REF_SYMBOL = Symbol('ref')

export function useV<T extends Construct>(model: T): ReplaceInstanceValues<InstanceType<T>> {
  const { _c: cacheMap } = getActiveCore()
  const instance = getActiveCore().init(model)
  const cache = cacheMap.get(instance) || {}

  if (cache[REF_SYMBOL])
    return cache[REF_SYMBOL]
  const proxy = new Proxy(instance, {
    get(target: any, key) {
      if (typeof target[key] === 'function') {
        if (!cache[key])
          cache[key] = target[key].bind(target)
        return cache[key]
      }
      if (target[key]?.__v_skip)// markRaw
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
