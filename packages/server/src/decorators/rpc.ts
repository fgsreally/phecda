import { SHARE_KEY, getState, setPropertyState } from 'phecda-core'
import { mergeObject } from './utils'

export function Event(isEvent = true): ClassDecorator | MethodDecorator {
  return (target: any, k?: PropertyKey) => {
    setPropertyState(target, k, (state) => {
      state.rpc = mergeObject(state.rpc || getState(target, k || SHARE_KEY)?.rpc, { isEvent })
    })
  }
}
export function Queue(queue?: string) {
  return (target: any, k?: PropertyKey) => {
    setPropertyState(target, k, (state) => {
      state.rpc = mergeObject(state.rpc || getState(target, k || SHARE_KEY)?.rpc, { queue })
    })
  }
}

export function Rpc(): ClassDecorator {
  return (target: any) => {
    setPropertyState(target, undefined, (state) => {
      state.controller = 'rpc'
    })
  }
}
