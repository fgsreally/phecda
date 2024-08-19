import { CLEAR_KEY, init, setMeta } from '../core'

export function Init(proto: any, property: PropertyKey) {
  setMeta(proto, property, undefined, {
    async init(instance: any) {
      return instance[property]()
    },
  })
}

export function Unmount(proto: any, property: PropertyKey) {
  setMeta(proto, property, undefined, {
    async unmount(instance: any) {
      return instance[property]()
    },
  })
}

export function Expose(proto: any, property?: PropertyKey, index?: any) {
  setMeta(proto, property, index, {})
}

export function Empty(model: any) {
  init(model.prototype)
}

export function Clear(proto: any, property?: PropertyKey, index?: any) {
  setMeta(proto, property, index, {
    [CLEAR_KEY]: true,
  })
}
// work for reflect-metadata
export function Injectable() {
  return (target: any) => Empty(target)
}
