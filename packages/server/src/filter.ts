import { Exception, UndefinedException } from './exception'
import type { P } from './types'
import { log } from './utils'

export const defaultFilter: P.Filter = (e) => {
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
