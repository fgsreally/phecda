import { Empty, set, setPropertyState } from 'phecda-core'

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
        if (!state.params)
          state.params = []

        const existItem = state.params.find((item: any) => item.index === index)
        if (existItem) {
          if (!existItem.define)
            existItem.define = {}
          existItem.define[key] = value
        }
      })
      return
    }
    setPropertyState(target, k, (state) => {
      if (!state.define)
        state.define = {}

      state.define[key] = value
    })
  }
}

export * from './param'
export * from './aop'
export * from './http'
export * from './rpc'
