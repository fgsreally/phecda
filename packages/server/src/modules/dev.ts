import { Empty } from 'phecda-core'
import { UNMOUNT_SYMBOL } from '../common'
import { emitter } from '../core'

@Empty
export class Dev {
  emitter=emitter
  [UNMOUNT_SYMBOL]: (() => void)[] = []
  onUnmount(cb: () => void) {
    this[UNMOUNT_SYMBOL].push(cb)
  }
}
