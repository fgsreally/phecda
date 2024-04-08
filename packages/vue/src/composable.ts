/* eslint-disable new-cap */
import type { UnwrapNestedRefs } from 'vue'
import { onBeforeUnmount, reactive, shallowReactive, toRaw, toRef } from 'vue'

import type { Construct, Events } from 'phecda-web'
import { emitter, get, getActiveInstance, getTag, invokeHandler } from 'phecda-web'
import type { ReplaceInstanceValues } from './types'
import type { DeepPartial } from './utils'
import { createSharedReactive, mergeReactiveObjects } from './utils'

const REF_SYMBOL = Symbol('ref')

function initInstance(model: Construct) {
  const proxyFn = get(model.prototype, 'shallow') ? shallowReactive : reactive
  const instance = proxyFn(new model())
  instance._promise = invokeHandler('init', instance)
  return instance
}

export function useO<T extends Construct>(model: T): UnwrapNestedRefs<InstanceType<T>> {
  const { state, origin } = getActiveInstance()

  if (get(model.prototype, 'isolate'))

    return initInstance(model)

  const tag = getTag(model)
  if (tag in state) {
    if (process.env.NODE_ENV === 'development') {
      if (origin.get(state[tag]) === model)
        return state[tag]
    }
    else {
      if (origin.get(state[tag]) !== model)
        console.warn(`Synonym model: Module taged "${String(tag)}" has been loaded before, so won't load Module "${model.name}"`)
      return state[tag]
    }
  }

  const instance = initInstance(model)

  state[tag] = instance

  origin.set(instance, model)
  return state[tag]
}

export function useRaw<T extends Construct>(model: T) {
  return toRaw(useO(model)) as unknown as InstanceType<T>
}
// like what pinia does
export function usePatch<T extends Construct>(model: T, Data: DeepPartial<InstanceType<T>>) {
  const instance = useO(model)
  mergeReactiveObjects(instance, Data)
}

export function useR<T extends Construct>(model: T): UnwrapNestedRefs<InstanceType<T>> {
  return useO(model)
}

export function useV<T extends Construct>(model: T): ReplaceInstanceValues<InstanceType<T>> {
  const { cache: cacheMap } = getActiveInstance()
  const instance = useO(model)
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
export function initialize<M extends Construct>(model: M, deleteOtherProperty = true): InstanceType<M> | void {
  const instance = useO(model)
  const newInstance = new model()
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
