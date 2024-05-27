import { SHARE_KEY, getState, setPropertyState } from 'phecda-core'
import { BaseParam } from './param'
import { mergeArray } from './utils'
export function Guard(...guards: string[]) {
  return (target: any, k?: PropertyKey) => {
    setPropertyState(target, k, (state) => {
      state.guards = [...new Set(mergeArray(state.gurads || getState(target, k || SHARE_KEY)?.guards, guards))]
    })
  }
}

export function Plugin(...plugins: string[]) {
  return (target: any, k?: PropertyKey) => {
    setPropertyState(target, k, (state) => {
      state.plugins = [...new Set(mergeArray(state.plugins || getState(target, k || SHARE_KEY)?.plugins, plugins))]
    })
  }
}

export function Interceptor(...interceptors: string[]) {
  return (target: any, k?: PropertyKey) => {
    setPropertyState(target, k, (state) => {
      state.interceptors = [...new Set(mergeArray(state.interceptors || getState(target, k || SHARE_KEY)?.interceptors, interceptors))]
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
