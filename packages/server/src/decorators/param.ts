import { getOwnState, setState, setStateKey } from 'phecda-core'

export function BaseParam(type: string, key: string): any {
  return (target: any, k: PropertyKey, index: number) => {
    setStateKey(target, k)

    const state = getOwnState(target, k)
    if (!state.params)
      state.params = []

    const existItem = state.params.find((item: any) => item.index === index)
    if (existItem)
      Object.assign(existItem, { type, key })

    else
      state.params.push({ type, key, index })

    setState(target, k, state)
  }
}

export function Pipe(key?: string, opts?: any) {
  return (target: any, k: PropertyKey, index: number) => {
    setStateKey(target, k)

    const state = getOwnState(target, k)

    if (!state.params)
      state.params = []

    const existItem = state.params.find((item: any) => item.index === index)
    if (existItem)
      Object.assign(existItem, { pipe: key, pipeOpts: opts })

    else
      state.params.push({ pipe: key, pipeOpts: opts, index })

    setState(target, k, state)
  }
}

export function Body(key = '') {
  return BaseParam('body', key)
}
// req.headers
export function Head(key: string) {
  return BaseParam('headers', key.toLowerCase())
}

export function Query(key = '') {
  return BaseParam('query', key)
}
export function Param(key: string) {
  return BaseParam('params', key)
}

// work for micro service
export function Arg() {
  return BaseParam('params', '')
}
