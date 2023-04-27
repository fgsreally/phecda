import type { Handler } from 'mitt'
import type { PhecdaEvents } from './types'
import { emitter } from './emitter'

export class PV {
  constructor() {

  }

  get tag() {
    // @ts-expect-error miss type
    return this._namespace.__TAG__
  }

  on<Key extends keyof PhecdaEvents>(type: Key, handler: Handler<PhecdaEvents[Key]>): void {
    emitter.on(type, handler)
  }

  emit(type: keyof PhecdaEvents, event: PhecdaEvents[keyof PhecdaEvents]) {
    emitter.emit(type, event)
  }

  off<Key extends keyof PhecdaEvents>(type: Key, handler?: Handler<PhecdaEvents[Key]>): void {
    emitter.off(type, handler)
  }
}
