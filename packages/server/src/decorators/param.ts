import { getOwnState, setState, setStateKey } from 'phecda-core'

export function BaseParam(type: string, key: string, defaultValue?: any): any {
  return (target: any, k: PropertyKey, index: number) => {
    setStateKey(target, k)

    const state = getOwnState(target, k)
    if (!state.params)
      state.params = []

    const existItem = state.params.find((item: any) => item.index === index)
    if (existItem)
      Object.assign(existItem, { type, key, defaultValue })

    else
      state.params.push({ type, key, index, defaultValue })

    setState(target, k, state)
  }
}

export function Pipe(key?: string) {
  return (target: any, k: PropertyKey, index: number) => {
    setStateKey(target, k)

    const state = getOwnState(target, k)

    if (!state.params)
      state.params = []

    const existItem = state.params.find((item: any) => item.index === index)
    if (existItem)
      Object.assign(existItem, { pipe: key })

    else
      state.params.push({ pipe: key, index })

    setState(target, k, state)
  }
}

export function Body(key = '', defaultValue?: any) {
  return BaseParam('body', key, defaultValue)
}
// req.headers
export function Head(key: string, defaultValue?: any) {
  return BaseParam('headers', key.toLowerCase(), defaultValue)
}

export function Query(key = '', defaultValue?: any) {
  return BaseParam('query', key, defaultValue)
}
export function Param(key: string, defaultValue?: any) {
  return BaseParam('params', key, defaultValue)
}

// work for micro service
export function Arg(defaultValue?: any) {
  return BaseParam('params', '', defaultValue)
}
