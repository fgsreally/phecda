import { Empty, Unmount } from 'phecda-core'
import { UNMOUNT_SYMBOL } from '../common'

@Empty
export class Dev {
  private readonly [UNMOUNT_SYMBOL]: (() => void)[] = []
  // work for hmr
  // exec callback  when module unmount
  onUnmount(cb: () => void) {
    this[UNMOUNT_SYMBOL].push(cb)
  }

  @Unmount
  // @ts-expect-error need private for ide
  private async unmount() {
    for (const cb of this[UNMOUNT_SYMBOL])
      await cb()
  }
}
