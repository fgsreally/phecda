export interface BaseError {
  __PS_ERROR__: true
  status: number
  message: string
  description: string

}

export function isError<T = any>(data: T | BaseError): data is BaseError {
  return typeof data === 'object' && data !== null && (data as any).__PS_ERROR__
}
