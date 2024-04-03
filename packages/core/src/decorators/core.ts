import { PHECDA_KEY, init, setExposeKey, setHandler, setIgnoreKey, setState, setStateVar } from '../core'

export function Init(proto: any, key: PropertyKey) {
  setStateVar(proto, key)

  setHandler(proto, key, {
    async init(instance: any) {
      return instance[key]()
    },
  })
}

export function Unmount(proto: any, key: PropertyKey) {
  setStateVar(proto, key)

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
    setStateVar(proto, k)
    setState(proto, k, {
      value,
    })
  }
}

export function Ignore(proto: any, key: PropertyKey) {
  setIgnoreKey(proto, key)
}

export function Clear(proto: any, key: PropertyKey) {
  init(proto)

  proto[PHECDA_KEY].__EXPOSE_VAR__.delete(key)
  proto[PHECDA_KEY].__IGNORE_VAR__.delete(key)
  proto[PHECDA_KEY].__STATE_VAR__.delete(key)
  proto[PHECDA_KEY].__STATE_HANDLER__.delete(key)
  proto[PHECDA_KEY].__STATE_NAMESPACE__.delete(key)
}

export function Expose(proto: any, key: PropertyKey) {
  setExposeKey(proto, key)
}

export function Empty(model: any) {
  init(model.prototype)
}
