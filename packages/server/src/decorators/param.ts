import { mergeState, setModalVar } from 'phecda-core'

export function BaseParam(type: string, key: string, validate?: boolean): any {
  return (target: any, k: PropertyKey, index: number) => {
    setModalVar(target, k)
    mergeState(target, k, {
      params: [{ type, key, index, validate }],
    })
  }
}

export function Body(key = '', usePipe?: boolean) {
  return BaseParam('body', key, usePipe)
}
export function Query(key: string, usePipe?: boolean) {
  return BaseParam('query', key, usePipe)
}
export function Param(key: string, usePipe?: boolean) {
  return BaseParam('params', key, usePipe)
}
