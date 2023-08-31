import { init, setModelVar, setState } from 'phecda-core'

export function Route(route: string, type?: string): any {
  return (target: any, key?: PropertyKey) => {
    // init(target)
    // if (!key)
    //   key = '__CLASS'
    // target = key === '__CLASS' ? target.prototype : target
    // setModelVar(target, key)

    // const state = target.__STATE_NAMESPACE__.get(key) || {}
    // state.route = {
    //   route,
    //   type,
    // }
    // setState(target, key, state)
    init(target)
    if (key) {
      const state = target._namespace.__STATE_NAMESPACE__.get(key) || {}
      setModelVar(target, key)

      state.route = {
        route,
        type,
      }
      setState(target, key, state)
    }
    else {
      setModelVar(target.prototype, '__CLASS')

      const state = target._namespace.__STATE_NAMESPACE__.get('__CLASS') || {}
      state.route = {
        route,
        type,
      }
      setState(target.prototype, '__CLASS', state)
    }
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

export function Delete(route: string) {
  return Route(route, 'delete')
}

export function Controller(route: string) {
  return Route(route)
}

export function Guard(...guards: string[]): any {
  return (target: any, key?: PropertyKey) => {
    if (key) {
      const state = target._namespace.__STATE_NAMESPACE__.get(key) || {}
      if (!state.guards)
        state.guards = []
      state.guards.push(...guards)
      setModelVar(target, key)
      setState(target, key, state)
    }
    else {
      setModelVar(target.prototype, '__CLASS')
      setState(target.prototype, '__CLASS', {
        guards: [...guards],
      })
    }
  }
}

export function Middle(...middlewares: string[]): any {
  return (target: any, key?: PropertyKey) => {
    if (key) {
      setModelVar(target, key)
      setState(target, key, {
        middlewares: [...middlewares],
      })
    }
    else {
      setModelVar(target.prototype, '__CLASS')
      setState(target.prototype, '__CLASS', {
        middlewares: [...middlewares],
      })
    }
  }
}

export function Interceptor(...interceptors: string[]): any {
  return (target: any, key?: PropertyKey) => {
    if (key) {
      setModelVar(target, key)
      const state = target._namespace.__STATE_NAMESPACE__.get(key) || {}
      if (!state.interceptors)
        state.interceptors = []
      state.interceptors.push(...interceptors)
      setModelVar(target, key)
      setState(target, key, state)
    }
    else {
      setModelVar(target.prototype, '__CLASS')
      setState(target.prototype, '__CLASS', {
        interceptors: [...interceptors],
      })
    }
  }
}
