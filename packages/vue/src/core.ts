import { reactive, shallowReactive } from 'vue'
import { Construct, Core, defaultWebInject, get, getTag } from 'phecda-web'

let activeCore: Core

export function getActiveCore() {
  return activeCore
}

export function createPhecda() {
  defaultWebInject()

  activeCore = new Core((instance: any) => {
    return get(instance, 'shallow') ? shallowReactive(instance) : reactive(instance)
  })

  return {
    serialize: activeCore.serialize.bind(activeCore),
    unmount: activeCore.unmountAll.bind(activeCore),
    load: activeCore.load.bind(activeCore),

  }
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
