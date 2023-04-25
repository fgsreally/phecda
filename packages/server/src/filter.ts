import { HttpException, UndefinedException } from './exception'
export type ErrorFilter<E extends HttpException = any> = (err: E | Error, contextData: any) => any

export const serverFilter: ErrorFilter = (e: any) => {
  if (!(e instanceof HttpException))
    e = new UndefinedException(e.message || e)
  return e.data
}

export const rabbitMqFilter: ErrorFilter = (e: any, data) => {
  const { channel, message } = data
  channel!.reject(message!, true)
}
