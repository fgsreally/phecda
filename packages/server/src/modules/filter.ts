import { getTag } from 'phecda-core'
import { Context, addFilter } from '../context'
import type { Exception } from '../exception'
import type { BaseCtx, BaseError } from '../types'
import { ServerBase } from './base'

export abstract class PFilter<Ctx extends BaseCtx = any, E extends Exception = Exception > extends ServerBase {
  readonly key: PropertyKey

  async init() {
    await super.init();
    //@ts-expect-error initialize
    this.key = getTag(this);
    addFilter(this.key, this.use.bind(this))
    this.onUnmount(() => {
      delete Context.filterRecord[this.key]
    })
  }
  
  abstract use(error: Error | E, ctx?: Ctx): BaseError
}
