import type { App } from 'vue'
import { markRaw } from 'vue'
import { injectProperty } from 'phecda-core'
import { emitter } from '../emitter'

export const phecdaSymbol = Symbol('phecda')

export function createPhecda() {
  const phecda = markRaw({
    install(app: App) {
      app.provide(phecdaSymbol, phecda)
      app.config.globalProperties.$phecda = phecda
      injectProperty('watcher', ({ eventName, instance, key }: { eventName: string; instance: any; key: string }) => {
        emitter.on(eventName, typeof instance[key] === 'function' ? instance[key].bind(instance) : (v: any) => instance[key] = v)
      })
    },
    useVMap: new WeakMap(),
    useOMap: new WeakMap(),
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
