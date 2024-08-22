import { set, setMeta } from 'phecda-web'
import type { WatchOptions, WatchStopHandle } from 'vue'
import { watchEffect } from 'vue'
export function Shallow(model: any) {
  set(model.prototype, 'shallow', true)
}

export function WatchEffect(option?: WatchOptions) {
  return (proto: any, key: string) => {
    let stopHandler: WatchStopHandle
    setMeta(proto, key, undefined, {
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
