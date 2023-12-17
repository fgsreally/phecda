import type { Exception } from '../../../exception'
import type { FastifyCtx } from '../context'
import type { ServerErr } from '../../../types'
import { setFilter } from '../context'

export abstract class FastifyFilter {
  constructor() {
    setFilter(this.use.bind(this))
  }

  abstract use< E extends Exception >(error: Error | E, tag?: string, ctx?: FastifyCtx): ServerErr | Promise<ServerErr>
}
