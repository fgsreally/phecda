import type { Construct, Events } from 'phecda-web'
import { useEffect } from 'react'
import { emitter } from 'phecda-web'
import { useSnapshot } from 'valtio'
import { getActiveCore } from './core'

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

export function useR<T extends Construct>(model: T): [InstanceType<T>, InstanceType<T>] {
  const proxyInstance = getActiveCore().init(model)
  return [useSnapshot(proxyInstance), proxyInstance]
}
