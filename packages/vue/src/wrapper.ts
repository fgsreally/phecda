import type { PhecdaEvents } from 'phecda-core'
import { emitter } from './emitter'

export class PV {
  constructor() {

  }

  get tag() {
    // @ts-expect-error 如在pv上声明，会覆盖原有_namespace
    return this._namespace.__TAG__
  }

  on<Key extends keyof PhecdaEvents>(type: Key, handler: (arg: PhecdaEvents[Key]) => void): void {
    (emitter as any).on(type, handler)
  }

  emit<Key extends keyof PhecdaEvents>(type: Key, param: PhecdaEvents[Key]) {
    (emitter as any).emit(type, param)
  }

  off<Key extends keyof PhecdaEvents>(type: Key, handler?: (arg: PhecdaEvents[Key]) => void): void {
    (emitter as any).off(type, handler)
  }
}
