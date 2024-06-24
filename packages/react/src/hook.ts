import type { Construct, Events } from 'phecda-web'
import { useContext, useEffect } from 'react'
import { bindMethod, emitter } from 'phecda-web'
import { useSnapshot } from 'valtio'
import { PhecdaContext } from './core'

const cacheMap = new WeakMap()
export function usePhecda() {
  const activePhecda = useContext(PhecdaContext)

  if (!activePhecda)
    throw new Error('[phecda-react]: must under <PhecdaContext.Provider></PhecdaContext.Provider> or manually inject the phecda instance ')

  if (!cacheMap.has(activePhecda))
    cacheMap.set(activePhecda, bindMethod(activePhecda))

  return activePhecda
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

export function useR<T extends Construct>(model: T): InstanceType<T> {
  const proxyInstance = usePhecda().init(model)
  return useSnapshot(proxyInstance) as any
}
