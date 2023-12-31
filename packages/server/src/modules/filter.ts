import { setFilter } from '../context'
import type { Exception } from '../exception'
import { defaultFilter } from '../filter'
import { Dev } from './dev'

export abstract class PFilter<C = any, S = any, E extends Exception = Exception > extends Dev {
  constructor() {
    super()
    setFilter(this.use.bind(this))
    this.onUnmount(() => {
      setFilter(defaultFilter)
    })
  }

  abstract use(error: Error | E, tag?: string, ctx?: C): S
}
