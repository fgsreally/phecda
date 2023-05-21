import { HttpException, UndefinedException } from './exception'
import type { ServerCtx, ServerMergeCtx } from './types'
export type ServerFilter<E extends HttpException = any> = (err: E | Error, contextData: ServerMergeCtx | ServerCtx) => any
export type MQFilter<E extends HttpException = any> = (err: E | Error, contextData: any) => any

export const serverFilter: ServerFilter = (e: any) => {
  if (!(e instanceof HttpException))
    e = new UndefinedException(e.message || e)
  return e.data
}

export const rabbitMqFilter: MQFilter = (e: any, data) => {
  const { channel, message } = data
  channel!.reject(message!, true)
}
