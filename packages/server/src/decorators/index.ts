import { SHARE_KEY, setState, setVar } from 'phecda-core'

export function Header(name: string, value: string) {
  return (target: any, k: PropertyKey) => {
    setVar(target, k)
    const state = target._namespace.__STATE_NAMESPACE__.get(k) || {}
    if (!state.header)
      state.header = {}

    state.header[name] = value
    setState(target, k, state)
  }
}

export function Define(key: string, value: any) {
  return (target: any, k?: PropertyKey) => {
    if (!k) {
      k = SHARE_KEY
      target = target.prototype
    }

    setVar(target, k)
    const state = target._namespace.__STATE_NAMESPACE__.get(k) || {}
    if (!state.define)
      state.define = {}

    state.define[key] = value
    setState(target, k, state)
  }
}

export * from './param'
export * from './route'
export * from './aop'
