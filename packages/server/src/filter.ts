import { Exception, UndefinedException } from './exception'
import { log } from './utils'
import type { FilterType } from './context'

export const defaultFilter: FilterType = (e) => {
  if (!(e instanceof Exception)) {
    log(e.message, 'error')
    console.error(e.stack)

    e = new UndefinedException(e.message || e)
  }
  else {
    log(`[${e.constructor.name}] ${e.message}`, 'error')
    console.error(e.stack)
  }

  return e.data
}
