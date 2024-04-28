import type { IncomingHttpHeaders } from 'node:http'
import type { ERROR_SYMBOL } from './common'
import type { Meta } from './meta'
export namespace P {

  export interface BaseContext {
    meta: Meta
    moduleMap: Record<string, any>
    parallel?: boolean
    type: string
    tag: string
    func: string
    [key: string]: any

  }
  export interface HttpContext extends BaseContext {
    query: Record<string, any>
    params: Record<string, string>
    body: Record<string, any>
    headers: IncomingHttpHeaders
    index?: number
    data: any
  }
  export interface Error {
    // as a symbol
    [ERROR_SYMBOL]: true
    status: number
    message: string
    description: string
  }
  export type Ret<T> = Awaited<T> extends { toJSON(): infer R } ? R : Awaited<T>
  //   export type RetOrErr<R> = { [K in keyof R]: Awaited<R[K]> | Error }

  export type RequestType = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head'

}
