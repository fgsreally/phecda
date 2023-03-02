/* eslint-disable no-prototype-builtins */
import { isReactive, isRef } from 'vue'
export type _DeepPartial<T> = { [K in keyof T]?: _DeepPartial<T[K]> }

export function isObject(o: any) {
  return Object.prototype.toString.call(o) === '[object Object]'
}

// copy form pinia
export function mergeReactiveObjects<
  T extends Record<any, unknown> | Map<unknown, unknown> | Set<unknown>,
>(target: T, patchToApply: _DeepPartial<T>): T {
  for (const key in patchToApply) {
    if (!patchToApply.hasOwnProperty(key))
      continue
    const subPatch = patchToApply[key]
    const targetValue = target[key]
    if (
      isObject(targetValue)
      && isObject(subPatch)
      && target.hasOwnProperty(key)
      && !isRef(subPatch)
      && !isReactive(subPatch)
    ) {
      // @ts-expect-error types ignore
      target[key] = mergeReactiveObjects(targetValue, subPatch)
    }
    else {
      // @ts-expect-error: subPatch is a valid value
      target[key] = subPatch
    }
  }

  return target
}
