import { injectProperty } from 'phecda-core'
import mitt from 'mitt'
import type { PhecdaEmitter } from './types'

//
export const emitter: PhecdaEmitter = mitt()

export function defaultWebInject() {
  if (!getProperty('watcher')) {
    injectProperty('watcher', ({ eventName, instance, key, options }: { eventName: any; instance: any; key: string; options?: { once: boolean } }) => {
      const fn = typeof instance[key] === 'function' ? instance[key].bind(instance) : (v: any) => instance[key] = v

      if (options?.once)

        (emitter as any).once(eventName, fn)

      else
        (emitter as any).on(eventName, fn)

      return () => (emitter as any).off(eventName)
    })
  }

  if (!getProperty('storage')) {
    injectProperty('storage', ({ tag, key, instance }: { instance: any; key: string; tag: string }) => {
      if (!tag)
        return
      const initstr = localStorage.getItem(tag)

      if (initstr) {
        const data = JSON.parse(initstr)
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
        localStorage.setItem(tag, JSON.stringify(key ? instance[key] : instance))
      })
    })
  }
}
