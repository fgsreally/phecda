import { SHARE_KEY, getOwnState, set, setState, setStateVar } from 'phecda-core'

export function Header(name: string, value: string) {
  return (target: any, k: PropertyKey) => {
    setStateVar(target, k)
    const state = getOwnState(target, k)
    if (!state.header)
      state.header = {}

    state.header[name] = value
    setState(target, k, state)
  }
}

export function Ctx(target: any, key: PropertyKey) {
  set(target, 'context', key)
}

export function Define(key: string, value: any) {
  return (target: any, k?: PropertyKey) => {
    if (!k) {
      k = SHARE_KEY
      target = target.prototype
    }

    setStateVar(target, k)
    const state = getOwnState(target, k)
    if (!state.define)
      state.define = {}

    state.define[key] = value
    setState(target, k, state)
  }
}

export * from './param'
export * from './route'
export * from './aop'
