import { UNMOUNT_SYMBOL } from '../common'

export class Dev {
  [UNMOUNT_SYMBOL]: (() => void)[] = []
  onUnmount(cb: () => void) {
    this[UNMOUNT_SYMBOL].push(cb)
  }
}
