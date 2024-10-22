import { Construct, type Events, bindMethod, emitter, getDefaultPhecda, getTag } from 'phecda-web'
import { UnwrapNestedRefs, getCurrentInstance, hasInjectionContext, inject, onUnmounted, toRaw, toRef } from 'vue'
import type { ReplaceInstanceValues } from './types'
import { createSharedReactive } from './utils'
import { VuePhecda, phecdaSymbol } from './core'
import { USE_DEVTOOLS } from './devtools'

const cacheMap = new WeakMap()

export function useRaw<Model extends Construct>(model: Model) {
  return toRaw(useR(model)) as unknown as InstanceType<Model>
}

export function getRaw<Model extends Construct>(model: Model) {
  return toRaw(getR(model)) as unknown as InstanceType<Model>
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

function setMetaToComponent(model: Construct) {
  if (USE_DEVTOOLS) {
    const currentInstance = getCurrentInstance()
    if (currentInstance && currentInstance.proxy) {
      const vm = currentInstance.proxy
      const cache: any = '_phecda_vue' in vm ? vm._phecda_vue! : ((vm as any)._phecda_vue = {})
      const tag = getTag(model)
      cache[tag] = usePhecda().init(model)
    }
  }
}

export function getPhecda(phecda?: VuePhecda) {
  const activePhecda = phecda || getDefaultPhecda('vue')
  if (!activePhecda)
    throw new Error('[phecda-vue]:  manually inject the phecda instance if there is no default phecda')
  if (!cacheMap.has(activePhecda))
    cacheMap.set(activePhecda, bindMethod(activePhecda))

  return cacheMap.get(activePhecda) as VuePhecda
}

export function useEvent<Key extends keyof Events>(eventName: Key, cb: (event: Events[Key]) => void) {
  onUnmounted(() => {
    emitter.off(eventName, cb)
  })
  emitter.on(eventName, cb)

  return {
    emit: (arg: Events[Key]) => emitter.emit(eventName, arg),
    cancel: () => emitter.off(eventName, cb),
  }
}

// 还原模块

export function useR<Model extends Construct>(model: Model, { keepAlive }: {
  keepAlive?: boolean
} = {}): UnwrapNestedRefs<InstanceType<Model>> {
  const phecda = usePhecda()
  if (keepAlive === false && phecda.has(model))
    onUnmounted(() => phecda.unmount(model))

  setMetaToComponent(model)
  return phecda.init(model) as any
}

export function getR<Model extends Construct>(model: Model, phecda?: VuePhecda): UnwrapNestedRefs<InstanceType<Model>> {
  return getPhecda(phecda).init(model) as any
}

export function useV<Model extends Construct>(model: Model, { keepAlive }: {
  keepAlive?: boolean
} = {}): ReplaceInstanceValues<InstanceType<Model>> {
  setMetaToComponent(model)
  const phecda = usePhecda()

  if (keepAlive === false && phecda.has(model))
    onUnmounted(() => phecda.unmount(model))

  const instance = phecda.init(model)

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

export function getV<Model extends Construct>(model: Model, phecda?: VuePhecda): ReplaceInstanceValues<InstanceType<Model>> {
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
