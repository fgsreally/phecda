import { setPropertyState } from './utils'

export function Route(route: string, type?: string): ClassDecorator | MethodDecorator {
  return (target: any, k?: PropertyKey) => {
    setPropertyState(target, k, (state) => {
      state.http = {
        route,
        type,
      }
    })
  }
}

export function Get(route = '') {
  return Route(route, 'get') as MethodDecorator
}

export function Post(route = '') {
  return Route(route, 'post') as MethodDecorator
}
export function Put(route = '') {
  return Route(route, 'put') as MethodDecorator
}

export function Patch(route = '') {
  return Route(route, 'patch') as MethodDecorator
}
export function Delete(route = '') {
  return Route(route, 'delete') as MethodDecorator
}

export function Controller(route = '') {
  return Route(route) as ClassDecorator
}
export function Event(isEvent = true): ClassDecorator | MethodDecorator {
  return (target: any, k?: PropertyKey) => {
    setPropertyState(target, k, (state) => {
      if (!state.rpc)
        state.rpc = {}
      state.rpc.isEvent = isEvent
    })
  }
}
export function Queue(queue?: string) {
  return (target: any, k?: PropertyKey) => {
    setPropertyState(target, k, (state) => {
      if (!state.rpc)
        state.rpc = {}
      state.rpc.queue = queue
    })
  }
}
