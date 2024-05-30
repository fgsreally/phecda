import { getState, setPropertyState } from 'phecda-core'
import { mergeObject } from './helper'

export function Route(route: string, type: string): MethodDecorator {
  return (target: any, k: PropertyKey) => {
    setPropertyState(target, k, (state) => {
      state.http = mergeObject((state.http || getState(target, k)?.http),
        {
          route,
          type,
        })
    })
  }
}
export function Header(headers: Record<string, string>): MethodDecorator {
  return (target: any, k: PropertyKey) => {
    setPropertyState(target, k, (state) => {
      if (!state.http)
        state.http = mergeObject(getState(target, k)?.http)

      state.http = mergeObject(state.http, {
        headers: mergeObject(state.http?.headers, headers),

      })
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
    setPropertyState(target, undefined, (state) => {
      state.controller = 'http'
      state.http = mergeObject(state.http || getState(target)?.http, { prefix })
    })
  }
}
