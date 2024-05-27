import { Empty, getState, set, setPropertyState } from 'phecda-core'
import { mergeObject, shallowClone } from './utils'

export function Injectable() {
  return (target: any) => Empty(target)
}

export const Ctx: PropertyDecorator = (target: any, key: PropertyKey) => {
  set(target, 'context', key)
}

export function Define(key: string, value: any): any {
  return (target: any, k?: any, index?: number) => {
    if (typeof index === 'number') {
      setPropertyState(target, k, (state) => {
        const parentState = getState(target, k)?.params || []

        if (!state.params)
          state.params = [...parentState].map(shallowClone)

        const existItem = state.params.find((item: any) => item.index === index)
        if (existItem) {
          if (!existItem.define)
            existItem.define = {}
          existItem.define[key] = value
        }
        else {
          state.params.push({ define: { [key]: value }, index })
        }
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

export * from './param'
export * from './aop'
export * from './http'
export * from './rpc'
