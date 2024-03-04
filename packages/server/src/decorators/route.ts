import { SHARE_KEY, setState, setVar } from 'phecda-core'

export function Route(route: string, type?: string): any {
  return (target: any, key?: PropertyKey) => {
    if (!key)
      key = SHARE_KEY
    target = key === SHARE_KEY ? target.prototype : target

    setVar(target, key)

    const state = target._namespace.__STATE_NAMESPACE__.get(key) || {}
    state.http = {
      route,
      type,
    }
    setState(target, key, state)
  }
}

export function Get(route = '') {
  return Route(route, 'get')
}

export function Post(route = '') {
  return Route(route, 'post')
}
export function Put(route = '') {
  return Route(route, 'put')
}

export function Patch(route = '') {
  return Route(route, 'patch')
}
export function Delete(route = '') {
  return Route(route, 'delete')
}

export function Controller(route = '') {
  return Route(route)
}
export function Rpc(...types: ('rabbitmq' | 'redis' | 'kafka' | string)[]) {
  return (target: any, key?: PropertyKey) => {
    if (!key)
      key = SHARE_KEY
    target = key === SHARE_KEY ? target.prototype : target
    setVar(target, key)
    const state = target._namespace.__STATE_NAMESPACE__.get(key) || {}
    if (!state.rpc)
      state.rpc = {}

    state.rpc.type = types
    setState(target, key, state)
  }
}
export function Event(isEvent = true) {
  return (target: any, key?: PropertyKey) => {
    if (!key)
      key = SHARE_KEY
    target = key === SHARE_KEY ? target.prototype : target
    setVar(target, key)
    const state = target._namespace.__STATE_NAMESPACE__.get(key) || {}
    if (!state.rpc)
      state.rpc = {}

    state.rpc.isEvent = isEvent
    setState(target, key, state)
  }
}
