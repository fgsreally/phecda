import type { App } from 'vue'
import { markRaw } from 'vue'

export const phecdaSymbol = Symbol('phecda')

export function createPhecda() {
  const phecda = markRaw({
    install(app: App) {
      app.provide(phecdaSymbol, phecda)
      app.config.globalProperties.$phecda = phecda
    },
    vProxyMap: new WeakMap(),
    vMap: new WeakMap(),
  })

  return phecda
}

interface PhecdaInstance {
  vProxyMap: WeakMap<any, any>
  vMap: WeakMap<any, any>
}

let activePhecda: PhecdaInstance = {
  vProxyMap: new WeakMap(),
  vMap: new WeakMap(),
}

export function setActivePhecda(phecda: PhecdaInstance) {
  activePhecda = phecda
}

export function getActivePhecda() {
  return activePhecda
}
