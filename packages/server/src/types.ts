import type { Wrap } from './utils'

export type Construct<T = any> = new (...args: any[]) => T

export interface PHandler {
  error?: (arg: any) => void
}
export interface ServerMeta {
  route?: {
    type: RequestType
    route: string
  }
  micro?: {

  }

  header: Record<string, string>
  params: { type: string; index: number; key: string; validate?: boolean }[]
  guards: string[]
  interceptors: string[]
  middlewares: string[]
  method: string
  name: string
}

export type RequestType = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head'

export type MergeType = <R extends Promise<any>[]> (...args: R) => { [K in keyof R]: Awaited<R[K]> }

export interface BaseError {
  error: true
  status: number
}

export interface PError extends BaseError { message: string; description: string}

export type ResOrErr<R > = { [K in keyof R]: Awaited<R[K]> | PError }

export type PRes<T> = T
/**
 * @experiment
 */
export type UnWrap<T extends any[]> = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  [K in keyof T]: T[K] extends Wrap<infer F, infer _> ? F : T[K];
}

export type Transform<A> = {
  [K in keyof A]: A[K] extends (...args: infer P) => infer R
    ? (...args: UnWrap<P> extends unknown[] ? UnWrap<P> : unknown[]) => R
    : never
}
