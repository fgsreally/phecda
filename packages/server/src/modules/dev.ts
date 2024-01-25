import { Empty } from 'phecda-core'
import { UNMOUNT_SYMBOL } from '../common'
import { emitter } from '../core'



@Empty
export class Dev {
  static config: any
  protected readonly emitter = emitter
  private readonly [UNMOUNT_SYMBOL]: (() => void)[] = []
  // work for hmr
  // exec callback  when module unmount
  onUnmount(cb: () => void) {
    this[UNMOUNT_SYMBOL].push(cb)
  }

}


export function setModelConfig<T extends typeof Dev>(model: T, conf: T['config']) {
  model.config = conf
}