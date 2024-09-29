import { getTag } from 'phecda-core'
import { Context, addGuard } from '../context'
import type { BaseContext } from '../types'
import { ServerBase } from './base'

export abstract class PGuard<C extends BaseContext = any> extends ServerBase {
  abstract use(ctx: C): Promise<boolean> | boolean
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
