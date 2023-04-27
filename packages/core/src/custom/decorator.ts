// custom decorator

import { regisHandler, setModalVar } from '../core'
import { getProperty } from '../namespace'
import type { PhecdaEvents } from '../types'

export function Watcher(eventName: keyof PhecdaEvents, options?: { once: boolean }) {
  return (obj: any, key: string) => {
    setModalVar(obj, key)
    regisHandler(obj, key, {
      init(instance: any) {
        getProperty('watcher')?.({ eventName, instance, key, options })
      },
    })
  }
}
