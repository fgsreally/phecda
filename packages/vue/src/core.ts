import { type App, hasInjectionContext, inject, reactive, shallowReactive } from 'vue'
import { WebPhecda, get } from 'phecda-web'

export const phecdaSymbol = Symbol('phecda-vue')

export function usePhecda(phecda?: VuePhecda) {
  if (phecda)
    return phecda
  const activePhecda = hasInjectionContext() && inject(phecdaSymbol)
  if (!activePhecda && process.env.NODE_ENV === 'development')
    throw new Error('[phecda-vue]: must install the vue plugin (if used in setup) or manually inject the phecda instance ')

  return activePhecda as VuePhecda
}

export class VuePhecda extends WebPhecda {
  install(app: App) {
    app.provide(phecdaSymbol, this)
  }
}

export function createPhecda() {
  return new VuePhecda((instance: any) => {
    return get(instance, 'shallow') ? shallowReactive(instance) : reactive(instance)
  })
}
