import { setModelVar, setState } from 'phecda-core'

export function Route(route: string, type?: string): any {
  return (target: any, key?: PropertyKey) => {
    if (!key)
      key = '__CLASS'
    target = key === '__CLASS' ? target.prototype : target

    setModelVar(target, key)

    const state = target._namespace.__STATE_NAMESPACE__.get(key) || {}
    state.http = {
      route,
      type,
    }
    setState(target, key, state)
  }
}

export function Get(route: string) {
  return Route(route, 'get')
}

export function Post(route: string) {
  return Route(route, 'post')
}
export function Put(route: string) {
  return Route(route, 'put')
}

export function Patch(route: string) {
  return Route(route, 'patch')
}
export function Delete(route: string) {
  return Route(route, 'delete')
}

export function Controller(route: string) {
  return Route(route)
}

export function Rpc(...rpc: string[]) {
  return (target: any, key: PropertyKey) => {
    setModelVar(target, key)
    const state = target._namespace.__STATE_NAMESPACE__.get(key) || {}
    state.rpc = rpc

    setState(target, key, state)
  }
}
