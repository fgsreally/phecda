import { PHECDA_KEY, SHARE_KEY, init, setExposeKey, setHandler, setIgnoreKey, setState, setStateKey } from '../core'
import type { Phecda } from '../types'

export function Init(proto: any, key: PropertyKey) {
  setStateKey(proto, key)

  setHandler(proto, key, {
    async init(instance: any) {
      return instance[key]()
    },
  })
}

export function Unmount(proto: any, key: PropertyKey) {
  setStateKey(proto, key)

  setHandler(proto, key, {
    async unmount(instance: any) {
      return instance[key]()
    },
  })
}

// bind value
// won't assign
export function Bind(value: any) {
  return (proto: any, k: PropertyKey) => {
    setStateKey(proto, k)
    setState(proto, k, {
      value,
    })
  }
}

export function Ignore(proto: any, key?: PropertyKey) {
  if (!key) {
    proto = proto.prototype
    key = SHARE_KEY
  };
  setIgnoreKey(proto, key)
}

export function Clear(proto: any, key?: PropertyKey) {
  if (!key) {
    proto = proto.prototype
    key = SHARE_KEY
  };
  init(proto);

  (proto as Phecda)[PHECDA_KEY].__CLEAR_KEY.add(key)
}

export function Expose(proto: any, key: PropertyKey) {
  setExposeKey(proto, key)
}

export function Empty(model: any) {
  init(model.prototype)
}

export function Injectable() {
  return (target: any) => Empty(target)
}
