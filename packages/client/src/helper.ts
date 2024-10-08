import { BaseError } from 'phecda-server'

export function isError<T = any>(data: T | BaseError): data is BaseError {
  return typeof data === 'object' && data !== null && (data as any).__PS_ERROR__
}
