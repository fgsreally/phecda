import { Base, Empty } from 'phecda-core'
import type { BaseContext } from '../types'
import { emitter } from '../core'

@Empty
export class ServerBase extends Base {
  protected context: BaseContext
  emitter = emitter
}
