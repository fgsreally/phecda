import { set, setHandler, setStateKey } from 'phecda-web'
import type { WatchOptions, WatchStopHandle } from 'vue'
import { watchEffect } from 'vue'
export function Shallow(isShallow = true) {
  return (model: any) => {
    set(model.prototype, 'shallow', isShallow)
  }
}

export function WatchEffect(option?: WatchOptions) {
  return (proto: any, key: string) => {
    setStateKey(proto, key)
    let stopHandler: WatchStopHandle
    setHandler(proto, key, {
      init(instance: any) {
        if (typeof instance[key] !== 'function')
          throw new Error('WatchEffect must decorate function')

        stopHandler = watchEffect(instance[key].bind(instance), option)
      },
      unmount() {
        return stopHandler?.()
      },
    })
  }
}
