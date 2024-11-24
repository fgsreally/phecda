import { Construct } from 'phecda-core'
import { IS_DEV } from './common'
import { log } from './utils'
export function HMR(cb: (oldModels: Construct[], newModels: Construct[]) => any) {
  if (IS_DEV) {
    if (!globalThis.__PS_HMR__)
      globalThis.__PS_HMR__ = []
    globalThis.__PS_HMR__.push(cb)
  }
}

export async function RELOAD(oldModels: Construct[], newModels: Construct[]) {
  log('reload module...')

  for (const cb of globalThis.__PS_HMR__) await cb(oldModels, newModels)

  log('reload done')
}

export function RELAUNCH() {
  if (IS_DEV)
    process.exit(2)
}
