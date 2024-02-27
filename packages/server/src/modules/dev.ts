import { Empty } from 'phecda-core'
import { UNMOUNT_SYMBOL } from '../common'

@Empty
export class Dev {
  private readonly [UNMOUNT_SYMBOL]: (() => void)[] = []
  // work for hmr
  // exec callback  when module unmount
  onUnmount(cb: () => void) {
    this[UNMOUNT_SYMBOL].push(cb)
  }
}
