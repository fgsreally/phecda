import { SHARE_KEY, getState, setPropertyState } from 'phecda-core'
import { mergeObject, shallowClone } from './helper'

export const Ctx: PropertyDecorator = (target: any, key: PropertyKey) => {
  setPropertyState(target, SHARE_KEY, (state) => {
    if (!state.ctxs)
      state.ctxs = new Set([...(getState(target)?.ctxs || [])])

    state.ctxs.add(key)
  })
}

export function Define(key: string, value: any): any {
  return (target: any, k?: any, index?: number) => {
    if (typeof index === 'number') {
      setPropertyState(target, k, (state) => {
        const parentState = getState(target, k)?.params || []

        if (!state.params)
          state.params = [...parentState].map(shallowClone)
        const existItem = state.params.find((item: any) => item.index === index)
        if (existItem)
          existItem.define = mergeObject(existItem.define, { [key]: value })

        else
          state.params.push({ define: { [key]: value }, index })
      })
      return
    }
    setPropertyState(target, k, (state) => {
      const parentState = getState(target, k)?.define
      if (!state.define)
        state.define = mergeObject(parentState)

      state.define[key] = value
    })
  }
}
