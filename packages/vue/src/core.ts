import { type App, reactive, shallowReactive } from 'vue'
import { WebPhecda, bindMethod, get } from 'phecda-web'

export const phecdaSymbol = Symbol(process.env.NODE_ENV === 'development' ? 'phecda-vue' : undefined)

export class VuePhecda extends WebPhecda {
  install(app: App) {
    app.provide(phecdaSymbol, this)
  }
}

export function createPhecda() {
  return new VuePhecda((instance: any) => {
    return bindMethod(get(instance, 'shallow') ? shallowReactive(instance) : reactive(instance))
  })
}
