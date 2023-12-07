import { HttpException, UndefinedException } from './exception'
import type { P } from './types'

export const defaultFilter: P.Filter = (e: any) => {
  if (!(e instanceof HttpException)) {
    console.error(e.stack)
    e = new UndefinedException(e.message || e)
  }
  else {
    console.error(e.message)
  }

  return e.data
}
