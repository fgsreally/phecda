import { type Events, Unmount, getTag } from 'phecda-core'
import { emitter } from './inject'

export class Base {
  private readonly __UNMOUNT_SYMBOL__: (() => void)[] = []
  private readonly __PROMISE_SYMBOL__: Promise<void>

  constructor() {

  }

  get tag(): PropertyKey {
    return getTag(this)
  }

  then(cb: () => void, reject?: (e: any) => void) {
    return this.__PROMISE_SYMBOL__.then(cb, reject)
  }

  on<Key extends keyof Events>(type: Key, handler: (arg: Events[Key]) => void): void {
    (emitter as any).on(type, handler)
    this.onUnmount(() => emitter.off(type, handler))
  }

  emit<Key extends keyof Events>(type: Key, param: Events[Key]) {
    (emitter as any).emit(type, param)
  }

  off<Key extends keyof Events>(type: Key, handler?: (arg: Events[Key]) => void): void {
    (emitter as any).off(type, handler)
  }

  private onUnmount(cb: () => void) {
    this.__UNMOUNT_SYMBOL__.push(cb)
  }

  @Unmount
  // @ts-expect-error for internal
  private _unmount() {
    return Promise.all(this.__UNMOUNT_SYMBOL__.map(fn => fn()))
  }
}
