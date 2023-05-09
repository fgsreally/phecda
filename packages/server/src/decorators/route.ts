import { mergeState, setModalVar } from 'phecda-core'

export function Route(route: string, type?: string): any {
  return (target: any, key?: PropertyKey) => {
    if (key) {
      setModalVar(target, key)
      mergeState(target, key, {
        route: {
          route,
          type,
        },
      })
    }
    else {
      setModalVar(target.prototype, '__CLASS')
      mergeState(target.prototype, '__CLASS', {
        route: {
          route,
          type,
        },
      })
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
      setModalVar(target, key)
      mergeState(target, key, {
        guards: [...guards],
      })
    }
    else {
      setModalVar(target.prototype, '__CLASS')
      mergeState(target.prototype, '__CLASS', {
        guards: [...guards],
      })
    }
  }
}

export function Middle(...middlewares: string[]): any {
  return (target: any, key?: PropertyKey) => {
    if (key) {
      setModalVar(target, key)
      mergeState(target, key, {
        middlewares: [...middlewares],
      })
    }
    else {
      setModalVar(target.prototype, '__CLASS')
      mergeState(target.prototype, '__CLASS', {
        middlewares: [...middlewares],
      })
    }
  }
}

export function Interceptor(...interceptors: string[]): any {
  return (target: any, key?: PropertyKey) => {
    if (key) {
      setModalVar(target, key)
      mergeState(target, key, {
        interceptors: [...interceptors],
      })
    }
    else {
      setModalVar(target.prototype, '__CLASS')
      mergeState(target.prototype, '__CLASS', {
        interceptors: [...interceptors],
      })
    }
  }
}
