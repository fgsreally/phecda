import { mergeState, setModalVar } from 'phecda-core'

export function Inject() { }

export function Route(route: string, type?: string) {
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
export function Controller(route: string) {
  return Route(route)
}

export function BaseParam(type: string, key: string) {
  return (target: any, k: PropertyKey, index: number) => {
    setModalVar(target, k)
    mergeState(target, k, {
      params: [{ type, key, index }],
    })
  }
}

export function Body(key: string) {
  return BaseParam('body', key)
}
export function Query(key: string) {
  return BaseParam('query', key)
}
export function Param(key: string) {
  return BaseParam('params', key)
}
