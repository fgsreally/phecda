import { proxy } from 'valtio'
import { Construct, Core, defaultWebInject, getTag } from 'phecda-web'

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

export function reset<Model extends Construct>(model: Model, deleteOtherProperty?: boolean) {
  return getActiveCore().reset(model, deleteOtherProperty)
}

export function ismount(model: Construct) {
  return getActiveCore().ismount(getTag(model))
}

export function unmount(model: Construct) {
  return getActiveCore().unmount(getTag(model))
}
