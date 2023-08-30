import { mergeState, setModalVar } from 'phecda-core'

export function BaseParam(type: string, key: string, validate?: any): any {
  return (target: any, k: PropertyKey, index: number) => {
    setModalVar(target, k)
    mergeState(target, k, {
      params: [{ type, key, index, validate }],
    })
  }
}

export function Body(key = '', pipeOpts?: any) {
  return BaseParam('body', key, pipeOpts)
}
export function Query(key = '', pipeOpts?: any) {
  return BaseParam('query', key, pipeOpts)
}
export function Param(key: string, pipeOpts?: any) {
  return BaseParam('params', key, pipeOpts)
}
