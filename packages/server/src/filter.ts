import { HttpException, UndefinedException } from './exception'
import type { ServerFilter } from './types'

export const serverFilter: ServerFilter = (e: any) => {
  if (!(e instanceof HttpException))
    e = new UndefinedException(e.message || e)
  return e.data
}
