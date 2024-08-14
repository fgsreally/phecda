import { PHECDA_KEY, SHARE_KEY, init, setExposeKey, setIgnoreKey, setMeta } from '../core'
import type { Phecda } from '../types'

export function Init(proto: any, property: PropertyKey) {
  setExposeKey(proto, property)

  setMeta(proto, property, {
    async init(instance: any) {
      return instance[property]()
    },
  })
}

export function Unmount(proto: any, property: PropertyKey) {
  setExposeKey(proto, property)

  setMeta(proto, property, {
    async unmount(instance: any) {
      return instance[property]()
    },
  })
}

export function Ignore(proto: any, property?: PropertyKey) {
  if (!property) {
    proto = proto.prototype
    property = SHARE_KEY
  };
  setIgnoreKey(proto, property)
}

export function Clear(proto: any, property?: PropertyKey) {
  if (!property) {
    proto = proto.prototype
    property = SHARE_KEY
  };
  init(proto);

  (proto as Phecda)[PHECDA_KEY].__CLEAR_KEY__.add(property)
}

export function Expose(proto: any, property: PropertyKey) {
  setExposeKey(proto, property)
}

export function Empty(model: any) {
  init(model.prototype)
}

export function Injectable() {
  return (target: any) => Empty(target)
}
