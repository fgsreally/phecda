import { proxy } from 'valtio'
import { Core, defaultWebInject } from 'phecda-web'

let activeCore: Core
export function createPhecda() {
  defaultWebInject()

  activeCore = new Core((instance: any) => {
    return proxy(instance)
  })
}

export function getActiveCore() {
  return activeCore
}
