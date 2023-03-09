import type { App } from 'vue'
import { markRaw } from 'vue'

export const phecdaSymbol = Symbol('phecda')

export function createPhecda() {
  const phecda = markRaw({
    install(app: App) {
      app.provide(phecdaSymbol, phecda)
      app.config.globalProperties.$phecda = phecda
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
