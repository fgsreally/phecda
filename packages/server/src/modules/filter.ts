import { setFilter } from '../context'
import type { Exception } from '../exception'
import type { ServerCtx, ServerErr } from '../types'

export abstract class ServerFilter {
  constructor() {
    setFilter(this.use.bind(this))
  }

  abstract use< E extends Exception >(error: Error | E, tag?: string, ctx?: ServerCtx): ServerErr | Promise<ServerErr>
}
