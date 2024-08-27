import { Construct, bindMethod, getTag } from 'phecda-web'
import { UnwrapNestedRefs, inject, provide, reactive, toRef } from 'vue'

import { ReplaceInstanceValues } from './types'
import { createSharedReactive } from './utils'

function useI<T extends Construct>(model: T): UnwrapNestedRefs<InstanceType<T>> {
  const tag = getTag(model)
  const injectKey = `phecda-vue:lib ${tag.toString()}`
  let existModule = inject(injectKey)
  if (!existModule) {
    const data = {
      // keep class name
      [model.name]: class extends model {

      },
    }
    existModule = bindMethod(reactive(new data[model.name]()))
    provide(injectKey, existModule)
    return existModule as any
  }
  else {
    return existModule as any
  }
}

export function useIR<T extends Construct>(model: T): UnwrapNestedRefs<InstanceType<T>> {
  return useI(model)
}

const weakmap = new WeakMap()

export function useIV<T extends Construct>(model: T): ReplaceInstanceValues<InstanceType<T>> {
  const instance = useI(model)

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
