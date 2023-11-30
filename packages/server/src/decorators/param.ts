import { setModelVar, setState } from 'phecda-core'

export function BaseParam(type: string, key: string, option?: any): any {
  return (target: any, k: PropertyKey, index: number) => {
    setModelVar(target, k)

    const state = target._namespace.__STATE_NAMESPACE__.get(k) || {}
    if (!state.params)
      state.params = []

    state.params.push({ type, key, index, option })
    setState(target, k, state)
  }
}

export function Body(key = '', pipeOpts?: any) {
  return BaseParam('body', key, pipeOpts)
}
// req.headers
export function Head(key: string, pipeOpts?: any) {
  return BaseParam('headers', key, pipeOpts)
}

export function Query(key = '', pipeOpts?: any) {
  return BaseParam('query', key, pipeOpts)
}
export function Param(key: string, pipeOpts?: any) {
  return BaseParam('params', key, pipeOpts)
}
