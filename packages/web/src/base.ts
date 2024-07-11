import { Base } from 'phecda-core'
import { emitter } from './inject'

export class WebBase extends Base {
  emitter = emitter
}
