/* eslint-disable new-cap */
import { proxy, useSnapshot } from 'valtio'
import type { Construct, Events } from 'phecda-web'
import { useEffect } from 'react'
import { emitter, get, getActiveInstance, getTag, invokeHandler, resetActiveInstance } from 'phecda-web'

export function useO<T extends Construct>(model: T) {
  const { state, origin } = getActiveInstance()
  if (get(model.prototype, 'isolate')) {
    const instance = new model()

    return instance
  }

  const tag = getTag(model)

  if (tag in state) {
    if (origin.get(state[tag]) !== model)
      console.warn(`Synonym module: Module taged "${String(tag)}" has been loaded before, so won't load Module "${model.name}"`)

    return state[tag]
  }
  const instance = new model()

  state[tag] = instance
  return instance
}

export function useR<T extends Construct>(model: T): [InstanceType<T>, InstanceType<T>] {
  const { cache: cacheMap } = getActiveInstance()
  const instance = useO(model)
  if (cacheMap.has(instance)) {
    const proxyInstance = cacheMap.get(instance)
    return [useSnapshot(proxyInstance), proxyInstance]
  }

  const proxyInstance = proxy(instance)

  instance._promise = invokeHandler('init', proxyInstance)

  cacheMap.set(instance, proxyInstance)

  return [useSnapshot(proxyInstance), proxyInstance]
}
export function createPhecda() {
  resetActiveInstance()
  return {

    load(state?: any) {
      const instance = getActiveInstance()
      if (state)
        instance.state = state
      return this
    },

    async  unmount() {
      const { state } = getActiveInstance()
      await Object.values(state).map(ins => invokeHandler('unmount', ins))
      resetActiveInstance()
    },

  }
}

export function useEvent<Key extends keyof Events>(eventName: Key, cb: (event: Events[Key]) => void) {
  useEffect(() => {
    return () => emitter.off(eventName, cb)
  })

  emitter.on(eventName, cb)

  return [
    (arg: Events[Key]) => emitter.emit(eventName, arg),
    () => emitter.off(eventName, cb),
  ]
}

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
