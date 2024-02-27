import type { App } from 'vue'
import { getCurrentInstance, inject, markRaw } from 'vue'
import type { ActiveInstance, Plugin } from '../types'
export const phecdaSymbol = Symbol('phecda')

export function createPhecda() {
  resetActiveInstance()
  const phecda = markRaw({
    plugins: [] as Plugin[],
    install(app: App) {
      const instance = getActiveInstance()
      instance.app = app
      app.provide(phecdaSymbol, instance)
      app.config.globalProperties.$phecda = instance
      this.plugins.forEach(p => p(instance))
    },

    use(...plugins: Plugin[]) {
      plugins.forEach(p => this.plugins.push(p))
      return this
    },

    load(state: any) {
      const instance = getActiveInstance()
      instance.state = state
      return this
    },

  })

  return phecda
}

let activeInstance: ActiveInstance

export function resetActiveInstance() {
  activeInstance = {
    state: {},
    _v: new WeakMap(),
    _r: new WeakMap(),
    _f: new WeakMap(),
    _c: new WeakMap(),

  } as any
}

export function getActiveInstance(): ActiveInstance {
  return (getCurrentInstance() && inject(phecdaSymbol)) || activeInstance
}
