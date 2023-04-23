import { HttpException, UndefinedException } from './exception'
import type { PError } from './types'

export type ErrorFilter<E extends HttpException = any> = (err: E | Error) => PError

export const defaultFilter: ErrorFilter = (e: any) => {
  if (!(e instanceof HttpException))
    e = new UndefinedException(e.message || e)
  return e.data
}
