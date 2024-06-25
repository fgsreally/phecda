import type { Construct, Events, WebPhecda } from 'phecda-web'
import { bindMethod, emitter } from 'phecda-web'
import { useContext, useEffect } from 'react'
import { useSnapshot } from 'valtio'
import { PhecdaContext } from './core'

const cacheMap = new WeakMap()
export function usePhecda() {
  const activePhecda = useContext(PhecdaContext)

  if (!activePhecda)
    throw new Error('[phecda-react]: must under <PhecdaContext.Provider></PhecdaContext.Provider> or manually inject the phecda instance ')

  if (!cacheMap.has(activePhecda))
    cacheMap.set(activePhecda, bindMethod(activePhecda))

  return cacheMap.get(activePhecda) as WebPhecda
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

export function useR<Model extends Construct>(model: Model) {
  const proxy = usePhecda().init(model) as InstanceType<Model>
  return [useSnapshot(proxy), bindMethod(proxy) as InstanceType<Model>]
}
