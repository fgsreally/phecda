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

const fnRegexCheckCacheMap = new WeakMap()

export function isConstructable(fn: any) {
  const hasPrototypeMethods
  = fn.prototype && fn.prototype.constructor === fn && Object.getOwnPropertyNames(fn.prototype).length > 1

  if (hasPrototypeMethods)
    return true
  if (fnRegexCheckCacheMap.has(fn))
    return fnRegexCheckCacheMap.get(fn)

  let constructable = hasPrototypeMethods
  if (!constructable) {
    const fnString = fn.toString()
    const constructableFunctionRegex = /^function\b\s[A-Z].*/
    const classRegex = /^class\b/
    constructable = constructableFunctionRegex.test(fnString) || classRegex.test(fnString)
  }
  fnRegexCheckCacheMap.set(fn, constructable)

  return constructable
}
