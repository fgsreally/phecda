import { setMeta } from 'phecda-core'

export function Route(route: string, type: string): MethodDecorator {
  return (target: any, property: PropertyKey) => {
    setMeta(target, property, undefined, {
      http: {
        route, type,
      },
    })
  }
}
export function Header(headers: Record<string, string>): MethodDecorator {
  return (target: any, property: PropertyKey) => {
    setMeta(target, property, undefined, {
      http: {
        headers,
      },
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

export function Search(route = '') {
  return Route(route, 'search')
}

export function Patch(route = '') {
  return Route(route, 'patch')
}
export function Delete(route = '') {
  return Route(route, 'delete')
}

export function Controller(prefix = '') {
  return (target: any) => {
    setMeta(target, undefined, undefined, {
      controller: 'http',
      http: { prefix },
    })
  }
}
