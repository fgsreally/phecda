// custom decorator

import { regisHandler, setModalVar } from '../core'
import { getProperty } from '../namespace'

export function Watcher(eventName: string) {
  return (obj: any, key: string) => {
    setModalVar(obj, key)
    regisHandler(obj, key, {
      init(instance: any) {
        getProperty('watcher')?.({ eventName, instance, key })
      },
    })
  }
}
