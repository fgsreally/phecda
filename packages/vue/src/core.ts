import { type App, reactive, shallowReactive } from 'vue'
import { WebPhecda, get } from 'phecda-web'

export const phecdaSymbol = Symbol('phecda-vue')

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
