import type { App } from 'vue'
import { markRaw } from 'vue'
import { getActiveInstance, resetActiveInstance, unmountParallel } from 'phecda-web'
export const phecdaSymbol = Symbol('phecda')

export function createPhecda() {
  resetActiveInstance()
  const phecda = markRaw({
    install(app: App) {
      const instance = getActiveInstance()
      instance.app = app

      app.provide(phecdaSymbol, instance)
      app.config.globalProperties.$phecda = instance
    },

    load(state: any) {
      const instance = getActiveInstance()
      instance.state = state

      return this
    },

    async unmount() {
      const { state } = getActiveInstance()

      await Object.values(state).map(ins => unmountParallel(ins))
      resetActiveInstance()
    },

  })

  return phecda
}
