import { reactive, shallowReactive } from 'vue'
import { Core, defaultWebInject, get } from 'phecda-web'

let activeCore: Core

export function getActiveCore() {
  return activeCore
}

export function createPhecda() {
  return {
    install() {
      defaultWebInject()

      activeCore = new Core((instance: any) => {
        return get(instance, 'shallow') ? shallowReactive(instance) : reactive(instance)
      })
    },
  }
}
