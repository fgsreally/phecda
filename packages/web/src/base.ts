import { type Events, getTag } from 'phecda-core'
import { emitter } from './plugin'

export class P {
  constructor() {

  }

  get tag(): PropertyKey {
    return getTag(this)
  }

  then(cb: () => void, reject?: (e: any) => void) {
    // @ts-expect-error when Init is async
    return this._promise.then(cb, reject)
  }

  on<Key extends keyof Events>(type: Key, handler: (arg: Events[Key]) => void): void {
    (emitter as any).on(type, handler)
  }

  emit<Key extends keyof Events>(type: Key, param: Events[Key]) {
    (emitter as any).emit(type, param)
  }

  off<Key extends keyof Events>(type: Key, handler?: (arg: Events[Key]) => void): void {
    (emitter as any).off(type, handler)
  }
}
