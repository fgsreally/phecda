import { Empty, Unmount } from './decorators'
import { getTag } from './helper'
import { Events } from './types'

@Empty
export abstract class Base {
  private readonly __UNMOUNT_SYMBOL__: (() => void)[] = []
  private readonly __PROMISE_SYMBOL__: Promise<void> // for init

  abstract emitter: any
  constructor() {

  }

  get tag(): PropertyKey {
    return getTag(this)
  }

  then(cb: () => void, reject?: (e: any) => void) {
    return this.__PROMISE_SYMBOL__.then(cb, reject)
  }

  on<Key extends keyof Events>(type: Key, handler: (arg: Events[Key]) => void): void {
    this.emitter.on(type, handler)
    this.onUnmount(() => this.emitter.off(type, handler))
  }

  emit<Key extends keyof Events>(type: Key, param: Events[Key]) {
    this.emitter.emit(type, param)
  }

  off<Key extends keyof Events>(type: Key, handler?: (arg: Events[Key]) => void): void {
    this.emitter.off(type, handler)
  }

  protected onUnmount(cb: () => void) {
    this.__UNMOUNT_SYMBOL__.push(cb)
  }

  @Unmount
  // @ts-expect-error for internal
  private _unmount() {
    return Promise.all(this.__UNMOUNT_SYMBOL__.map(fn => fn()))
  }
}
