import type { StorageParam, WatcherParam } from 'phecda-core'
import { getProperty, injectProperty } from 'phecda-core'
import mitt from 'mitt'
import type { PhecdaEmitter } from './types'

export const emitter: PhecdaEmitter = mitt()

export function defaultWebInject() {
  if (!getProperty('watcher')) {
    injectProperty('watcher', ({ eventName, instance, key, options }: WatcherParam) => {
      const fn = typeof instance[key] === 'function' ? instance[key].bind(instance) : (v: any) => instance[key] = v

      if (options?.once) {
        const handler = () => {
          fn();
          (emitter as any).off(eventName)
        }

        (emitter as any).on(eventName, handler)
      }

      else { (emitter as any).on(eventName, fn) }

      return () => (emitter as any).off(eventName)
    })
  }

  if (!getProperty('storage')) {
    injectProperty('storage', ({ tag, key, instance, toJSON, toString }: StorageParam) => {
      if (!tag)
        return
      const initstr = localStorage.getItem(tag)

      if (initstr) {
        const data = toJSON(initstr)
        if (key) {
          instance[key] = data
        }
        else {
          for (const i in data) {
            if (i)
              instance[i] = data[i]
          }
        }
      }
      globalThis.addEventListener('beforeunload', () => {
        localStorage.setItem(tag, toString(key ? instance[key] : instance))
      })
    })
  }
}
