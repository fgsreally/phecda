import type { App } from 'vue'
import { markRaw } from 'vue'
import type { Plugin } from 'phecda-web'
import { getActiveInstance, resetActiveInstance } from 'phecda-web'
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
      this.plugins.forEach(p => p.setup(instance))
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

    unmount() {
      const instance = getActiveInstance()
      this.plugins.forEach(p => p.unmount?.(instance))
    },

  })

  return phecda
}
