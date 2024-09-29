import type { StorageParam, WatcherParam } from 'phecda-core'
import { getInject, setInject } from 'phecda-core'
import mitt from 'mitt'
import type { PhecdaEmitter } from './types'

export const emitter: PhecdaEmitter = mitt()

export function defaultWebInject() {
  if (!getInject('watcher')) {
    setInject('watcher', ({ eventName, instance, property, options }: WatcherParam) => {
      const fn = typeof instance[property] === 'function' ? instance[property].bind(instance) : (v: any) => instance[property] = v

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

  if (!getInject('storage')) {
    setInject('storage', ({ tag, property, instance, toJSON, toString }: StorageParam) => {
      tag = `phecda:${property ? `${tag}-${property as string}` : tag}`
      const initstr = localStorage.getItem(tag)
      if (initstr) {
        const data = toJSON(initstr)
        if (property) {
          instance[property] = data
        }
        else {
          for (const i in data) {
            if (i)
              instance[i] = data[i]
          }
        }
      }
      localStorage.setItem(tag, toString(property ? instance[property] : instance))

      globalThis.addEventListener('beforeunload', () => {
        localStorage.setItem(tag, toString(property ? instance[property] : instance))
      })
    })
  }
}
