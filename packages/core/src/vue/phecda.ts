import type { App } from 'vue'
import { markRaw } from 'vue'

export const phecdaSymbol = Symbol('phecda')

export function createPhecda() {
  const phecda = markRaw({
    install(app: App) {
      app.provide(phecdaSymbol, phecda)
      app.config.globalProperties.$phecda = phecda
    },
    uesVMap: new WeakMap(),
    uesOMap: new WeakMap(),
    uesRMap: new WeakMap(),
  })

  return phecda
}

interface PhecdaInstance {
  uesVMap: WeakMap<any, any>
  uesOMap: WeakMap<any, any>
  uesRMap: WeakMap<any, any>

}

let activePhecda: PhecdaInstance = {
  uesVMap: new WeakMap(),
  uesOMap: new WeakMap(),
  uesRMap: new WeakMap(),

}

export function setActivePhecda(phecda: PhecdaInstance) {
  activePhecda = phecda
}

export function getActivePhecda() {
  return activePhecda
}
