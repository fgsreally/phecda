import { BaseContext } from '../../context'
import type { P } from '../../types'
import { defaultFilter } from '../../filter'
import { defaultPipe } from '../../pipe'

export const guardsRecord = {} as Record<string, P.Guard<void>>

export const interceptorsRecord = {} as Record<string, P.Interceptor<void>>

export const singletonConf = {
  pipe: defaultPipe,
  filter: defaultFilter,
}
export class Context extends BaseContext<null> {
  singletonConf = singletonConf
  interceptorsRecord = interceptorsRecord
  guardsRecord = guardsRecord
}

export function setPipe(pipe: P.Pipe<void>) {
  singletonConf.pipe = pipe
}

export function setFilter(filter: P.Filter<void, {
  error: Boolean
} & { [key in string]: any }>) {
  singletonConf.filter = filter
}

export function addGuard(key: string, handler: P.Guard<void>) {
  guardsRecord[key] = handler
}

export function addInterceptor(key: string, handler: P.Interceptor<void>) {
  interceptorsRecord[key] = handler
}
