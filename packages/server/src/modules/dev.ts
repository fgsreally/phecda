import { Empty, Unmount } from 'phecda-core'
import { UNMOUNT_SYMBOL } from '../common'
import type { BaseContext } from '../types'

@Empty
export class Dev {
  private readonly [UNMOUNT_SYMBOL]: (() => void)[] = []

  protected context: BaseContext
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
