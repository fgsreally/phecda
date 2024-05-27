import { SHARE_KEY, getState, setPropertyState } from 'phecda-core'

export function Event(isEvent = true): ClassDecorator | MethodDecorator {
  return (target: any, k?: PropertyKey) => {
    const parentState = getState(target, k || SHARE_KEY)?.rpc

    setPropertyState(target, k, (state) => {
      state.rpc = {
        ...parentState,
        ...state.rpc,
        isEvent,
      }
    })
  }
}
export function Queue(queue?: string) {
  return (target: any, k?: PropertyKey) => {
    const parentState = getState(target, k || SHARE_KEY)?.rpc

    setPropertyState(target, k, (state) => {
      state.rpc = {
        ...parentState,
        ...state.rpc,
        queue,
      }
    })
  }
}

export function Rpc(): ClassDecorator | MethodDecorator {
  return (target: any, k?: PropertyKey) => {
    setPropertyState(target, k, (state) => {
      state.controller = 'rpc'
    })
  }
}
