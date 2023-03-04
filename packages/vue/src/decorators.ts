import { regisHandler, setModalState } from 'phecda-core'
import { emitter } from '../src/index'

export function Watcher(eventName: string) {
  return (obj: any, key: string) => {
    setModalState(obj, key)
    regisHandler(obj, key, {
      init(instance: any) {
        emitter.on(eventName, instance[key].bind(instance))
      },
    })
  }
}
