import { getSymbol } from 'phecda-core'
import { Context, addFilter } from '../context'
import type { Exception } from '../exception'
import type { P } from '../types'
import { Dev } from './dev'

export abstract class PFilter<C extends P.BaseContext = any, E extends Exception = Exception > extends Dev {
  readonly key: string
  constructor(tag?: string) {
    super()
    this.key = tag || getSymbol(this)

    addFilter(this.key, this.use.bind(this))
    this.onUnmount(() => {
      delete Context.filterRecord[this.key]
    })
  }

  abstract use(error: Error | E, ctx?: C): P.Error
}
