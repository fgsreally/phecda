import type Redis from 'ioredis'
import { BaseContext } from '../../context'
import type { P } from '../../types'
import { defaultFilter } from '../../filter'
import { defaultPipe } from '../../pipe'
import type { Meta } from '../../meta'

export const guardsRecord = {} as Record<string, P.Guard<void>>

export const interceptorsRecord = {} as Record<string, P.Interceptor<void>>

export const singletonConf = {
  pipe: defaultPipe,
  filter: defaultFilter,
}

export interface RedisCtx {
  type: 'redis'
  meta?: Meta
  moduleMap: Record<string, any>
  redis: Redis
  msg: string
  channel: string
  // JSON parse msg
  data: any
}
export class Context extends BaseContext<RedisCtx> {
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
