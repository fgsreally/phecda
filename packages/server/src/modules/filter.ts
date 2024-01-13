import { setFilter } from '../context'
import type { Exception } from '../exception'
import { defaultFilter } from '../filter'
import type { P } from '../types'
import { Dev } from './dev'

export abstract class PFilter<C = any, E extends Exception = Exception > extends Dev {
  constructor() {
    super()
    setFilter(this.use.bind(this))
    this.onUnmount(() => {
      setFilter(defaultFilter)
    })
  }

  abstract use(error: Error | E, tag?: string, ctx?: C): P.Error
}
