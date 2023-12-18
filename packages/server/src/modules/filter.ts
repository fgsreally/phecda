import { setFilter } from '../context'
import type { Exception } from '../exception'

export abstract class PFilter {
  constructor() {
    setFilter(this.use.bind(this))
  }

  abstract use< C, S, E extends Exception >(error: Error | E, tag?: string, ctx?: C): S
}
