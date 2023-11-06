import { HttpException, UndefinedException } from './exception'
import type { ServerFilter } from './types'

export const serverFilter: ServerFilter = (e: any) => {
  if (!(e instanceof HttpException)) {
    console.error(e.stack)
    e = new UndefinedException(e.message || e)
  }
  else {
    console.error(e.message)
  }

  return e.data
}
