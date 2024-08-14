import { getMeta, setPropertyState } from 'phecda-core'
import { BaseParam } from './param'
export function Guard(...guards: string[]) {
  return (target: any, k?: PropertyKey) => {
    setPropertyState(target, k, (state) => {
      if (!state.guards)
        state.guards = new Set([...(getMeta(target, k)?.guards || [])])

      guards.forEach((guard) => {
        if (state.guards.has(guard))
          state.guards.delete(guard)

        state.guards.add(guard)
      })
    })
  }
}

export function Plugin(...plugins: string[]) {
  return (target: any, k?: PropertyKey) => {
    setPropertyState(target, k, (state) => {
      if (!state.plugins)
        state.plugins = new Set([...(getMeta(target, k)?.plugins || [])])

      plugins.forEach((plugin) => {
        if (state.plugins.has(plugin))
          state.plugins.delete(plugin)

        state.plugins.add(plugin)
      })
    })
  }
}

export function Interceptor(...interceptors: string[]) {
  return (target: any, k?: PropertyKey) => {
    setPropertyState(target, k, (state) => {
      if (!state.interceptors)
        state.interceptors = new Set([...(getMeta(target, k)?.interceptors || [])])

      interceptors.forEach((interceptor) => {
        if (state.interceptors.has(interceptor))
          state.interceptors.delete(interceptor)

        state.interceptors.add(interceptor)
      })
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
