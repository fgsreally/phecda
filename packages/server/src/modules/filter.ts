import { setFilter } from '../context'
import type { HttpException } from '../exception'
import type { ServerCtx, ServerErr } from '../types'

export abstract class ServerFilter {
  constructor() {
    setFilter(this.use.bind(this))
  }

  abstract use< E extends HttpException >(error: Error | E, ctx?: ServerCtx): ServerErr | Promise<ServerErr>
}
