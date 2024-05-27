import { getState, setPropertyState } from 'phecda-core'

export function Route(route: string, type: string): MethodDecorator {
  return (target: any, k: PropertyKey) => {
    const parentState = getState(target, k)?.http || {}
    setPropertyState(target, k, (state) => {
      state.http = {
        ...parentState,
        route,
        type,
      }
    })
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
  return (target: any) => {
    setPropertyState(target, undefined, (state) => {
      state.controller = 'http'

      state.http = {
        prefix: route,
      }
    })
  }
}
