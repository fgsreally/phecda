import { Pipe } from '../decorators'
import { to } from '../helper'

export function toNumber() {
  return Pipe(to((param: any) => Number(param)))
}

export function toString() {
  return Pipe(to((param: any) => String(param)))
}
