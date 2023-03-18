// custom decorator

import { regisHandler, setModalState } from '../core'
import { getProperty } from '../namespace'

export function Watcher(eventName: string) {
  return (obj: any, key: string) => {
    setModalState(obj, key)
    regisHandler(obj, key, {
      init(instance: any) {
        getProperty('watcher')?.on(eventName, instance[key].bind(instance))
      },
    })
  }
}
