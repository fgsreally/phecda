import { BaseParam } from './param'
import { setPropertyState } from './utils'
export function Guard(...guards: string[]): ClassDecorator | MethodDecorator {
  return (target: any, k?: PropertyKey) => {
    setPropertyState(target, k, (state) => {
      if (!state.guards)
        state.guards = []
      state.guards.push(...guards)
    })
  }
}

export function Plugin(...plugins: string[]): ClassDecorator | MethodDecorator {
  return (target: any, k?: PropertyKey) => {
    setPropertyState(target, k, (state) => {
      if (!state.plugins)
        state.plugins = []
      state.plugins.push(...plugins)
    })
  }
}

export function Interceptor(...interceptors: string[]): ClassDecorator | MethodDecorator {
  return (target: any, k?: PropertyKey) => {
    setPropertyState(target, k, (state) => {
      if (!state.interceptors)
        state.interceptors = []
      state.interceptors.push(...interceptors)
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
