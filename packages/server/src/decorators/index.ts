import { set } from 'phecda-core'
import { setPropertyState } from './utils'

export function Header(name: string, value: string): MethodDecorator {
  return (target: any, k: PropertyKey) => {
    setPropertyState(target, k, (state) => {
      if (!state.header)
        state.header = {}

      state.header[name] = value
    })
  }
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
export * from './route'
export * from './aop'
