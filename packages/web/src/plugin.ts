import { injectProperty } from 'phecda-core'
import mitt from 'mitt'
import type { PhecdaEmitter, Plugin } from './types'

//
export const emitter: PhecdaEmitter = mitt()

export const storagePlugin = () => {
  return <Plugin>{
    setup() {
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
    },
  }
}

export const watchPlugin = () => {
  const eventRecord = [] as [string, (event: any) => void][]

  return <Plugin>{
    setup() {
      injectProperty('watcher', ({ eventName, instance, key, options }: { eventName: any; instance: any; key: string; options?: { once: boolean } }) => {
        const fn = typeof instance[key] === 'function' ? instance[key].bind(instance) : (v: any) => instance[key] = v

        if (options?.once) {
          const handler = (...args: any) => {
            fn(...args);
            (emitter as any).off(eventName, handler)
          }
          (emitter as any).on(eventName, handler)
          eventRecord.push([eventName, handler])
        }
        else {
          eventRecord.push([eventName, fn]);
          (emitter as any).on(eventName, fn)
        }
      })
    },

    unmount() {
      eventRecord.forEach(([eventName, handler]) =>
        (emitter as any).off(eventName as any, handler),
      )
    },

  }
}
