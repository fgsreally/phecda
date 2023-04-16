import { mergeState, setModalVar } from 'phecda-core'

export function Inject() { }

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
export function Controller(route: string) {
  return Route(route)
}

export function BaseParam(type: string, key: string, validate = false): any {
  return (target: any, k: PropertyKey, index: number) => {
    setModalVar(target, k)
    mergeState(target, k, {
      params: [{ type, key, index, validate }],
    })
  }
}

export function Body(key: string, validate?: boolean) {
  return BaseParam('body', key, validate)
}
export function Query(key: string, validate?: boolean) {
  return BaseParam('query', key, validate)
}
export function Param(key: string, validate?: boolean) {
  return BaseParam('params', key, validate)
}
