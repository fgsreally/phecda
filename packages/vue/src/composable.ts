import { Construct, type Events, bindMethod, emitter, getDefaultPhecda } from 'phecda-web'
import { UnwrapNestedRefs, hasInjectionContext, inject, onBeforeUnmount, toRaw, toRef } from 'vue'
import type { ReplaceInstanceValues } from './types'
import { createSharedReactive } from './utils'
import { VuePhecda, phecdaSymbol } from './core'

const cacheMap = new WeakMap()

export function useRaw<T extends Construct>(model: T) {
  return toRaw(useR(model)) as unknown as InstanceType<T>
}

export function usePhecda() {
  if (!hasInjectionContext())
    throw new Error('[phecda-vue]: use hook inside component setup function')

  const activePhecda = inject(phecdaSymbol)
  if (!activePhecda)
    throw new Error('[phecda-vue]: must install the vue plugin ')
  if (!cacheMap.has(activePhecda))
    cacheMap.set(activePhecda, bindMethod(activePhecda))

  return cacheMap.get(activePhecda) as VuePhecda
}

export function getPhecda(phecda?: VuePhecda) {
  const activePhecda = phecda || getDefaultPhecda()
  if (!activePhecda)
    throw new Error('[phecda-vue]:  manually inject the phecda instance if there is no default phecda')
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

export function useR<T extends Construct>(model: T): UnwrapNestedRefs<InstanceType<T>> {
  return usePhecda().init(model) as any
}

export function getR<T extends Construct>(model: T, phecda?: VuePhecda): UnwrapNestedRefs<InstanceType<T>> {
  return getPhecda(phecda).init(model) as any
}

export function useV<T extends Construct>(model: T): ReplaceInstanceValues<InstanceType<T>> {
  const instance = usePhecda().init(model)

  if (cacheMap.has(instance))
    return cacheMap.get(instance)

  const cache = {} as Record<PropertyKey, any>

  const proxy = new Proxy(instance, {
    get(target: any, key) {
      if (typeof target[key] === 'function')

        return target[key]

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

export function getV<T extends Construct>(model: T, phecda?: VuePhecda): ReplaceInstanceValues<InstanceType<T>> {
  const instance = getPhecda(phecda).init(model)

  if (cacheMap.has(instance))
    return cacheMap.get(instance)

  const cache = {} as Record<PropertyKey, any>

  const proxy = new Proxy(instance, {
    get(target: any, key) {
      if (typeof target[key] === 'function')

        return target[key]

      if (target[key]?.__v_skip)// markRaw
        return target[key]

      const cacheRef = cache[key]
      if (cacheRef && cacheRef.r)
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
