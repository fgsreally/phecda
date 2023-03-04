import type { Emitter, Handler } from 'mitt'
import type { Phecda } from 'phecda-core'
import type { PhecdaEvents } from './types'
import { emitter } from './emitter'

export class P {
  protected static emitter: Emitter<PhecdaEvents> = emitter

  protected _namespace: Phecda['_namespace']
  // _emitter: Emitter<PhecdaEvents> = window.emitter
  constructor() {

  }

  get tag() {
    return this._namespace.__TAG__
  }

  on<Key extends keyof PhecdaEvents>(type: Key, handler: Handler<PhecdaEvents[Key]>): void {
    P.emitter.on(type, handler)
  }

  emit(type: keyof PhecdaEvents, event: PhecdaEvents[keyof PhecdaEvents]) {
    P.emitter.emit(type, event)
  }

  off<Key extends keyof PhecdaEvents>(type: Key, handler?: Handler<PhecdaEvents[Key]>): void {
    P.emitter.off(type, handler)
  }
}
