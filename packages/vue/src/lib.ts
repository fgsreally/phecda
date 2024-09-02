import { Construct, bindMethod, getParamtypes, getTag, invokeInit, invokeUnmount } from 'phecda-web'
import { UnwrapNestedRefs, getCurrentInstance, inject, onBeforeUnmount, provide, reactive, toRef } from 'vue'

import { ReplaceInstanceValues } from './types'
import { createSharedReactive } from './utils'

export function hasI(
  model: Construct,
) {
  const tag = getTag(model)
  const injectKey = `phecda-vue:lib ${tag.toString()}`
  return !!inject(injectKey)
}

export function useIR<T extends Construct>(model: T, forceProvide = false): UnwrapNestedRefs<InstanceType<T>> {
  const tag = getTag(model)
  const instance: any = getCurrentInstance()

  if (!instance['phecda-vue'])
    instance['phecda-vue'] = new WeakMap()

  const modelMap = instance['phecda-vue'] as WeakMap<Construct, any>

  const injectKey = `phecda-vue:lib ${tag.toString()}`

  let existModule = modelMap.get(model) || inject(injectKey)
  if (!existModule || forceProvide) {
    const data = {
      // keep class name
      [model.name]: class extends model {

      },
    }
    const paramtypes = getParamtypes(model) as Construct[] || []
    existModule = bindMethod(reactive(new data[model.name](...paramtypes.map((param: any) => useIR(param)))))
    invokeInit(existModule)
    provide(injectKey, existModule)
    modelMap.set(model, existModule)
    onBeforeUnmount(() => invokeUnmount(existModule))
    return existModule as any
  }
  else {
    return existModule as any
  }
}

const weakmap = new WeakMap()

export function useIV<T extends Construct>(model: T, forceProvide = false): ReplaceInstanceValues<InstanceType<T>> {
  const instance = useIR(model, forceProvide)

  if (weakmap.has(instance))
    return weakmap.get(instance)

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

  weakmap.set(instance, proxy)

  return proxy
}
