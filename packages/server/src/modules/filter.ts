import { setFilter } from '../context'
import type { Exception } from '../exception'
import { defaultFilter } from '../filter'
import { Dev } from './dev'

export abstract class PFilter extends Dev {
  constructor() {
    super()
    setFilter(this.use.bind(this))
    this.onUnmount(() => {
      setFilter(defaultFilter)
    })
  }

  abstract use< C, S, E extends Exception >(error: Error | E, tag?: string, ctx?: C): S
}
