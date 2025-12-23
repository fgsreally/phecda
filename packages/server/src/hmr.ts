//only work for dev
import { Construct } from 'phecda-core'
import { IS_DEV, PS_EXIT_CODE } from './common'
import { log } from './utils'
export function HMR(cb: (oldModels: Construct[], newModels: Construct[]) => any) {
  if (IS_DEV) {
    if (!globalThis.__PS_HMR__)
      globalThis.__PS_HMR__ = []
    globalThis.__PS_HMR__.push(cb)
  }
}

export async function RELOAD(oldModels: Construct[], newModels: Construct[]) {
  if(IS_DEV){
    log('reload module...')
    for (const cb of globalThis.__PS_HMR__) await cb(oldModels, newModels)
    log('reload done')
  }

}

export function RELAUNCH() {
  if (IS_DEV) {
    log('relaunch...')

    process.exit(PS_EXIT_CODE.RELAUNCH)
  }
}

export function EXIT(){
  if(IS_DEV){
    log('exit...')
    process.exit(PS_EXIT_CODE.EXIT)
  }
}
