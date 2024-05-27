import { SHARE_KEY, getState, setPropertyState } from 'phecda-core'
import { BaseParam } from './param'
export function Guard(...guards: string[]): ClassDecorator | MethodDecorator {
  return (target: any, k?: PropertyKey) => {
    const parentState = getState(target, k || SHARE_KEY)?.guards
    setPropertyState(target, k, (state) => {
      state.guards = [...new Set([...parentState, ...state.guards, ...guards])]
    })
  }
}

export function Plugin(...plugins: string[]): ClassDecorator | MethodDecorator {
  return (target: any, k?: PropertyKey) => {
    const parentState = getState(target, k || SHARE_KEY)?.plugins

    setPropertyState(target, k, (state) => {
      state.plugins = [...new Set([...parentState, ...state.plugins, ...plugins])]
    })
  }
}

export function Interceptor(...interceptors: string[]): ClassDecorator | MethodDecorator {
  return (target: any, k?: PropertyKey) => {
    const parentState = getState(target, k || SHARE_KEY)?.interceptors

    setPropertyState(target, k, (state) => {
      state.interceptors = [...new Set([...parentState, ...state.interceptors, ...interceptors])]
    })
  }
}
export function Filter(filter: string) {
  return (target: any, k?: PropertyKey) => {
    setPropertyState(target, k, state => state.filter = filter)
  }
}
export function Pipe(pipe?: string) {
  return (target: any, k?: any, index?: any) => {
    if (typeof index === 'number') {
      BaseParam({ pipe })(target, k, index)

      return
    }
    setPropertyState(target, k, state => state.pipe = pipe)
  }
}
