import { mergeState, setModalVar } from 'phecda-core'

export function BaseParam(type: string, key: string, validate?: boolean): any {
  return (target: any, k: PropertyKey, index: number) => {
    setModalVar(target, k)
    mergeState(target, k, {
      params: [{ type, key, index, validate }],
    })
  }
}

export function Body(key = '', validate?: boolean) {
  return BaseParam('body', key, validate)
}
export function Query(key: string, validate?: boolean) {
  return BaseParam('query', key, validate)
}
export function Param(key: string, validate?: boolean) {
  return BaseParam('params', key, validate)
}
