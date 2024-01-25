import { getSymbol } from 'phecda-core'
import { Context, addGuard } from '../context'
import type { P } from '../types'
import { Dev } from './dev'

export abstract class PGuard<C extends P.BaseContext = any> extends Dev {
  abstract use(ctx: C): Promise<boolean> | boolean
  readonly key: string
  constructor(tag?: string) {
    super()
    this.key = tag || getSymbol(this)

    addGuard(this.key, this.use.bind(this))

    this.onUnmount(() => {
      delete Context.guardRecord[this.key]
    })
  }
}
