import { Empty } from 'phecda-core'
import { UNMOUNT_SYMBOL } from '../common'

@Empty
export class Dev {
  [UNMOUNT_SYMBOL]: (() => void)[] = []
  onUnmount(cb: () => void) {
    this[UNMOUNT_SYMBOL].push(cb)
  }
}
