import { HttpException, UndefinedException } from './exception'
import type { MQFilter, ServerFilter } from './types'

export const serverFilter: ServerFilter = (e: any) => {
  if (!(e instanceof HttpException))
    e = new UndefinedException(e.message || e)
  return e.data
}

export const rabbitMqFilter: MQFilter = (e: any, data) => {
  const { channel, message } = data
  channel!.reject(message!, true)
}
