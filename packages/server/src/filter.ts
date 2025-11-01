import { LOG_LEVEL } from './common'
import { Exception, UndefinedException } from './exception'
import { log } from './utils'
import type { FilterType } from './context'

export const defaultFilter: FilterType = (e) => {
  if (!(e instanceof Exception)) {
    //@todo
    log(e.message, 'error')
    if (LOG_LEVEL <= 0)
      console.error(e.stack)

    e = new UndefinedException(e.message || e)
  }
  else {
    log(`[${e.constructor.name}] ${e.message}`, 'error')
    if (LOG_LEVEL <= 0)
      console.error(e.stack)
  }

  return (e as Exception).data
}
