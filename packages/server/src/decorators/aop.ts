import { setModelVar, setState } from 'phecda-core'

export function Guard(...guards: string[]): any {
  return (target: any, key?: PropertyKey) => {
    if (!key)
      key = '__CLASS'
    target = key === '__CLASS' ? target.prototype : target

    setModelVar(target, key)

    const state = target._namespace.__STATE_NAMESPACE__.get(key) || {}
    if (!state.guards)
      state.guards = []
    state.guards.push(...guards)
    setState(target, key, state)
  }
}

export function Plugin(...plugins: string[]): any {
  return (target: any, key?: PropertyKey) => {
    if (!key)
      key = '__CLASS'
    target = key === '__CLASS' ? target.prototype : target

    setModelVar(target, key)

    const state = target._namespace.__STATE_NAMESPACE__.get(key) || {}
    if (!state.plugins)
      state.plugins = []
    state.plugins.push(...plugins)
    setState(target, key, state)
  }
}

export function Interceptor(...interceptors: string[]): any {
  return (target: any, key?: PropertyKey) => {
    if (!key)
      key = '__CLASS'
    target = key === '__CLASS' ? target.prototype : target

    setModelVar(target, key)

    const state = target._namespace.__STATE_NAMESPACE__.get(key) || {}
    if (!state.interceptors)
      state.interceptors = []
    state.interceptors.push(...interceptors)
    setState(target, key, state)
  }
}
