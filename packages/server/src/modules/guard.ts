import { getTag } from 'phecda-core'
import { Context, addGuard } from '../context'
import type { BaseCtx } from '../types'
import { ServerBase } from './base'

export abstract class PGuard<Ctx extends BaseCtx = any> extends ServerBase {
  abstract use(ctx: Ctx, next: () => Promise<any>): any
  readonly key: PropertyKey
  priority = 0

  constructor(tag?: string) {
    super()
    this.key = tag || getTag(this)

    addGuard(this.key, this.use.bind(this), this.priority)

    this.onUnmount(() => {
      delete Context.guardRecord[this.key]
    })
  }
}
