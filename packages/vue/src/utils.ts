import type { EffectScope } from 'vue'

import { effectScope, onScopeDispose, markRaw as raw } from 'vue'
import type { Raw } from './types'

export function markRaw<T extends object>(value: T): Raw<T> {
  return raw(value) as any
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

  const cb = () => {
    subscribers++
    if (!state) {
      scope = effectScope(true)
      state = scope.run(() => composable())
    }
    onScopeDispose(dispose)
    return state
  }

  // just a symbol
  cb.r = true

  return cb
}
