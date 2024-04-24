import { SHARE_KEY, getOwnState, setState, setStateKey } from 'phecda-core'

export function Route(route: string, type?: string): any {
  return (target: any, key?: PropertyKey) => {
    if (!key)
      key = SHARE_KEY
    target = key === SHARE_KEY ? target.prototype : target

    setStateKey(target, key)

    const state = getOwnState(target, key)
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
export function Event(isEvent = true) {
  return (target: any, key?: PropertyKey) => {
    if (!key)
      key = SHARE_KEY
    target = key === SHARE_KEY ? target.prototype : target
    setStateKey(target, key)
    const state = getOwnState(target, key)
    if (!state.rpc)
      state.rpc = {}
    state.rpc.isEvent = isEvent
    setState(target, key, state)
  }
}
export function Queue(queue?: string) {
  return (target: any, key?: PropertyKey) => {
    if (!key)
      key = SHARE_KEY
    target = key === SHARE_KEY ? target.prototype : target
    setStateKey(target, key)
    const state = getOwnState(target, key) || {}
    if (!state.rpc)
      state.rpc = {}
    state.rpc.queue = queue
    setState(target, key, state)
  }
}
