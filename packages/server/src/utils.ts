import type { ServerCtx, ServerMergeCtx } from './types'

export const isUndefined = (obj: any): obj is undefined =>
  typeof obj === 'undefined'
export const isNil = (obj: any): obj is null | undefined =>
  isUndefined(obj) || obj === null

export const isObject = (fn: any): fn is object =>
  !isNil(fn) && typeof fn === 'object'

export function resolveDep(ret: any, key: string) {
  if (key)
    return ret?.[key]
  return ret
}

export function isMerge(data: ServerCtx | ServerMergeCtx): data is ServerMergeCtx {
  return !!(data as ServerMergeCtx).isMerge
}
