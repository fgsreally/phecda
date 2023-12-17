import type { Exception } from '../../../exception'
import type { ExpressCtx } from '../context'
import type { ServerErr } from '../../../types'
import { setFilter } from '../context'

export abstract class ExpressFilter {
  constructor() {
    setFilter(this.use.bind(this))
  }

  abstract use< E extends Exception >(error: Error | E, tag?: string, ctx?: ExpressCtx): ServerErr | Promise<ServerErr>
}
