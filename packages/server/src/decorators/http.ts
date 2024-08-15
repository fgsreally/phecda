import { setMeta } from 'phecda-core'

export function Route(route: string, type: string): MethodDecorator {
  return (target: any, property: PropertyKey) => {
    setMeta(target, property, {
      http: {
        route, type,
      },
    })
    // setPropertyState(target, k, (state) => {
    //   state.http = mergeObject((state.http || getMeta(target, k)?.http),
    //     {
    //       route,
    //       type,
    //     })
    // })
  }
}
export function Header(headers: Record<string, string>): MethodDecorator {
  return (target: any, property: PropertyKey) => {
    setMeta(target, property, {
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

export function Patch(route = '') {
  return Route(route, 'patch')
}
export function Delete(route = '') {
  return Route(route, 'delete')
}

export function Controller(prefix = '') {
  return (target: any) => {
    setMeta(target, undefined, {
      controller: 'http',
      http: { prefix },
    })
  }
}
