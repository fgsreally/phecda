import type { ServerCtx, ServerMergeCtx } from './types'

export function isMerge(data: ServerCtx | ServerMergeCtx): data is ServerMergeCtx {
  return !!(data as ServerMergeCtx).isMerge
}

export function resolveDep(ret: any, key: string) {
  if (key)
    return ret?.[key]
  return ret
}
