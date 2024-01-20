import { getSymbol } from 'phecda-core'
import { Context, addGuard } from '../context'
import { Dev } from './dev'
import { P } from '../types'

export abstract class PGuard<C extends P.BaseContext= P.BaseContext> extends Dev {
  abstract use( ctx: C): Promise<boolean> | boolean
  readonly key: string
  constructor(tag?: string) {
    super()
    this.key = tag || getSymbol(this)

    addGuard<C>(this.key, this.use.bind(this))

    this.onUnmount(() => {
      delete Context.guardRecord[this.key]
    })
  }
}
