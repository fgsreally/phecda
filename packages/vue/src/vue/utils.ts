/* eslint-disable prefer-spread */
/* eslint-disable no-prototype-builtins */
import type { EffectScope } from 'vue'
import { effectScope, isReactive, isRef, onScopeDispose } from 'vue'
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

export function wrapError(target: any, key: PropertyKey, errorHandler: Function) {
  if (isAsyncFunc(target[key])) {
    return (...args: any) => {
      return target[key].apply(target, args).catch(errorHandler)
    }
  }
  else {
    return (...args: any) => {
      try {
        return target[key].apply(target, args)
      }
      catch (e) {
        return errorHandler(e)
      }
    }
  }
}

export function isAsyncFunc(fn: Function) {
  return (fn as any)[Symbol.toStringTag] === 'AsyncFunction'
}

export function createSharedComputed() {

}

export function createSharedReactive<F extends (...args: any) => any>(composable: F): () => ReturnType<F> {
  let subscribers = 0
  let state: ReturnType<F>
  let scope: EffectScope

  const dispose = () => {
    if (scope && --subscribers <= 0) {
      scope.stop();
      (state as any) = (scope as any) = null
    }
  }

  return () => {
    subscribers++
    if (!state) {
      scope = effectScope(true)
      state = scope.run(() => composable())
    }
    onScopeDispose(dispose)
    return state
  }
}
