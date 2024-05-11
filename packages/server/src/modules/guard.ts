import { getTag } from 'phecda-core'
import { Context, addGuard } from '../context'
import type { BaseContext } from '../types'
import { Dev } from './dev'

export abstract class PGuard<C extends BaseContext = any> extends Dev {
  abstract use(ctx: C): Promise<boolean> | boolean
  readonly key: PropertyKey
  constructor(tag?: string) {
    super()
    this.key = tag || getTag(this)

    addGuard(this.key, this.use.bind(this))

    this.onUnmount(() => {
      delete Context.guardRecord[this.key]
    })
  }
}
