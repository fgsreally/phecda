import { Construct, type Events, bindMethod, emitter } from 'phecda-web'
import { UnwrapNestedRefs, hasInjectionContext, inject, onBeforeUnmount, toRaw, toRef } from 'vue'
import type { ReplaceInstanceValues } from './types'
import { createSharedReactive } from './utils'
import { VuePhecda, phecdaSymbol } from './core'

const cacheMap = new WeakMap()

export function useRaw<T extends Construct>(model: T) {
  return toRaw(useR(model)) as unknown as InstanceType<T>
}

export function usePhecda(phecda?: VuePhecda) {
  const activePhecda = phecda || (hasInjectionContext() && inject(phecdaSymbol))
  if (!activePhecda)
    throw new Error('[phecda-vue]: must install the vue plugin (if used in setup) or manually inject the phecda instance ')
  if (!cacheMap.has(activePhecda))
    cacheMap.set(activePhecda, bindMethod(activePhecda))

  return cacheMap.get(activePhecda) as VuePhecda
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

export function useR<T extends Construct>(model: T, phecda?: VuePhecda): UnwrapNestedRefs<InstanceType<T>> {
  return usePhecda(phecda).init(model) as any
}

export function useV<T extends Construct>(model: T, phecda?: VuePhecda): ReplaceInstanceValues<InstanceType<T>> {
  const instance = usePhecda(phecda).init(model)

  if (cacheMap.has(instance))
    return cacheMap.get(instance)

  const cache = {} as Record<PropertyKey, any>

  const proxy = new Proxy(instance, {
    get(target: any, key) {
      if (typeof target[key] === 'function') {
        // if (target[key].toString().startsWith('('))
        //   return target[key]

        // if (!cache[key])
        //   cache[key] = target[key].bind(target)
        // return cache[key]
        return target[key]
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

  cacheMap.set(instance, proxy)
  return proxy
}
