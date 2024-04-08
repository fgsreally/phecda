import type { StorageParam, WatcherParam } from 'phecda-core'
import { SHARE_KEY, getInject, setInject } from 'phecda-core'
import mitt from 'mitt'
import type { PhecdaEmitter } from './types'

export const emitter: PhecdaEmitter = mitt()

export function defaultWebInject() {
  if (!getInject('watcher')) {
    setInject('watcher', ({ eventName, instance, key, options }: WatcherParam) => {
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

  if (!getInject('storage')) {
    setInject('storage', ({ tag, key, instance, toJSON, toString }: StorageParam) => {
      if (key === SHARE_KEY)
        key = ''

      tag = `phecda:${key ? `${tag}-${key as string}` : tag}`
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
      localStorage.setItem(tag, toString(key ? instance[key] : instance))

      globalThis.addEventListener('beforeunload', () => {
        localStorage.setItem(tag, toString(key ? instance[key] : instance))
      })
    })
  }
}
