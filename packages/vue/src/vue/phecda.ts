import type { App, UnwrapNestedRefs } from 'vue'
import { markRaw } from 'vue'
import { getProperty, getTag, injectProperty } from 'phecda-core'
import { emitter } from '../emitter'
export const phecdaSymbol = Symbol('phecda')

export const interval = {

} as any
export function createPhecda(symbol?: string) {
  const phecda = markRaw({
    install(app: App) {
      interval.app = app
      app.provide(phecdaSymbol, phecda)
      app.config.globalProperties.$phecda = phecda
      if (!window.__PHECDA_VUE__)
        window.__PHECDA_VUE__ = {}

      if (symbol) {
        window.__PHECDA_VUE__[symbol] = {
          instance: phecda,
          snapshot: () => {
            const ret = [] as { key: string; value: any }[]
            const { useOMap } = getActivePhecda()
            for (const [key, value] of useOMap)
              ret.push({ key: getTag(key) || key.name, value })

            return ret
          },
        }
      }
      let eventRecord = [] as [string, (event: any) => void][]
      if (!getProperty('watcher')) {
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
      const originUnmount = app.unmount.bind(app)
      app.unmount = () => {
        eventRecord.forEach(([eventName, handler]) =>
          (emitter as any).off(eventName as any, handler),
        )
        eventRecord = []
        if (symbol)
          delete window.__PHECDA_VUE__[symbol]
        originUnmount()
      }
    },
    // useVMap: new WeakMap(),
    // useOMap: new Map(),
    // useRMap: new WeakMap(),
    // fnMap: new WeakMap(),
    // computedMap: new WeakMap(),
  })

  return phecda
}

interface PhecdaInstance {
  useVMap: WeakMap<any, any>
  useOMap: Map<any, any>
  useRMap: WeakMap<any, any>
  fnMap: WeakMap<any, any>
  computedMap: WeakMap<any, any>
}

let activePhecda: PhecdaInstance = {
  useVMap: new WeakMap(),
  useOMap: new Map(),
  useRMap: new WeakMap(),
  fnMap: new WeakMap(),
  computedMap: new WeakMap(),
}

export function setActivePhecda(phecda: PhecdaInstance) {
  activePhecda = phecda
}

export function getActivePhecda() {
  return activePhecda
}

// get reactive store in lib or other place outside app
export function getReactiveMap(symbol: string) {
  if (!window.__PHECDA_VUE__?.[symbol])
    return null

  const ret = new Map<string, UnwrapNestedRefs<any>>()
  window.__PHECDA_VUE__[symbol].snapshot.forEach(({ key, value }: { key: string; value: any }) => {
    ret.set(key, value)
  })
  return ret
}
