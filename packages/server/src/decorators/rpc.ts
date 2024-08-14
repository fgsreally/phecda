import { getMeta, setPropertyState } from 'phecda-core'
import { mergeObject } from './helper'

export function Event(isEvent = true) {
  return (target: any, k?: PropertyKey) => {
    setPropertyState(target, k, (state) => {
      state.rpc = mergeObject(state.rpc || getMeta(target, k)?.rpc, { isEvent })
    })
  }
}
export function Queue(queue = '') {
  return (target: any, k?: PropertyKey) => {
    setPropertyState(target, k, (state) => {
      state.rpc = mergeObject(state.rpc || getMeta(target, k)?.rpc, { queue })
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
