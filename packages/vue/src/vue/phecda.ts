import type { App, UnwrapNestedRefs } from 'vue'
import { markRaw } from 'vue'
import type { PhecdaInstance, Plugin } from '../types'
export const phecdaSymbol = Symbol('phecda')

export function createPhecda() {
  const phecda = markRaw({
    install(app: App) {
      replaceActivePhecda(app)
      app.provide(phecdaSymbol, phecda)
      app.config.globalProperties.$phecda = phecda
    },

    use(...plugins: Plugin[]) {
      const instance = getActivePhecda()
      plugins.forEach(p => p(instance))
      return this
    },

  })

  return phecda
}

let activePhecda: PhecdaInstance

export function replaceActivePhecda(app?: App) {
  if (!app) {
    activePhecda = undefined as any
  }
  else {
    activePhecda = {
      useOMap: new Map(),
      useVMap: new WeakMap(),
      useRMap: new WeakMap(),
      fnMap: new WeakMap(),
      computedMap: new WeakMap(),
      app,
    }
  }
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
