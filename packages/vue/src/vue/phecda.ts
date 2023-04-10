import type { App } from 'vue'
import { markRaw } from 'vue'
import { getTag, injectProperty } from 'phecda-core'
import { emitter } from '../emitter'

export const phecdaSymbol = Symbol('phecda')

export function createPhecda(symbol?: string) {
  const phecda = markRaw({
    install(app: App) {
      app.provide(phecdaSymbol, phecda)
      app.config.globalProperties.$phecda = phecda
      if (!window._phecda)
        window._phecda = {}

      if (symbol) {
        window._phecda[symbol] = {
          instance: phecda,
          snapshot: () => {
            const ret = [] as { key: string; value: any }[]
            // @ts-expect-error it works
            for (const [key, value] of phecda.useOMap)
              ret.push({ key: getTag(key) || key.name, value })

            return ret
          },
        }
      }
      const eventRecord = [] as [string, (event: any) => void][]
      injectProperty('watcher', ({ eventName, instance, key }: { eventName: string; instance: any; key: string }) => {
        const fn = typeof instance[key] === 'function' ? instance[key].bind(instance) : (v: any) => instance[key] = v
        eventRecord.push([eventName, fn])
        emitter.on(eventName, fn)
      })
      const originUnmount = app.unmount.bind(app)
      app.unmount = () => {
        eventRecord.forEach(([eventName, handler]) =>
          emitter.off(eventName, handler),
        )
        if (symbol)
          delete window._phecda[symbol]
        originUnmount()
      }
    },
    useVMap: new WeakMap(),
    useOMap: new (symbol ? Map : WeakMap)(),
    useRMap: new WeakMap(),
    fnMap: new WeakMap(),
    computedMap: new WeakMap(),
  })

  return phecda
}

interface PhecdaInstance {
  useVMap: WeakMap<any, any>
  useOMap: WeakMap<any, any>
  useRMap: WeakMap<any, any>
  fnMap: WeakMap<any, any>
  computedMap: WeakMap<any, any>
}

let activePhecda: PhecdaInstance = {
  useVMap: new WeakMap(),
  useOMap: new WeakMap(),
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
