/* eslint-disable no-prototype-builtins */
import { DeepPartial } from './types'

export function isObject(o: any) {
  return Object.prototype.toString.call(o) === '[object Object]'
}

export function deepMerge<
    T extends Record<any, unknown> | Map<unknown, unknown> | Set<unknown>,
  >(target: T, patchToApply: DeepPartial<T>): T {
  for (const key in patchToApply) {
    if (!patchToApply.hasOwnProperty(key))
      continue
    const subPatch = patchToApply[key]
    const targetValue = target[key]
    if (
      isObject(targetValue)
        && isObject(subPatch)
        && target.hasOwnProperty(key)

    ) {
      // @ts-expect-error types ignore
      target[key] = deepMerge(targetValue, subPatch)
    }
    else {
      // @ts-expect-error: subPatch is a valid value
      target[key] = subPatch
    }
  }

  return target
}
