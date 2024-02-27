import type { Events } from 'phecda-web'
import { emitter } from 'phecda-web'

export class PV {
  constructor() {

  }

  get tag() {
    // @ts-expect-error 如在pv上声明，会覆盖原有_namespace
    return this.__TAG__
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
