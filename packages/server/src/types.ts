import type { IncomingHttpHeaders } from 'http'
import type { Events } from 'phecda-core'
import type { Meta } from './meta'
import type { ERROR_SYMBOL } from './common'
export interface Emitter {
  on<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  once<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  off<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  removeAllListeners<N extends keyof Events>(eventName: N): void
  emit<N extends keyof Events>(eventName: N, param: Events[N]): void
}

export type ToClientMap<T = any> = {
  [K in keyof T]: T[K] extends (new (...args: any) => any) ? ToClientInstance<PickFunc<InstanceType<T[K]>>> : void
}

export type ToClientInstance<R extends Record<string, (...args: any) => any>> = {
  [K in keyof R]: ToClientFn<R[K]>
}

export type ToClientFn<T extends (...args: any) => any> = (...p: Parameters<T>) => Promise<BaseReturn<ReturnType<T>>>

type PickKeysByValue<Type, Value> = { [Key in keyof Type]: Type[Key] extends Value ? Key : never }[keyof Type]

export type PickFunc<T> = Pick<T, PickKeysByValue<T, (...args: any) => any>>
export type OmitFunction<T> = Omit<T, PickKeysByValue<T, (...args: any) => any>>

export interface BaseContext {
  meta: Meta
  moduleMap: Record<string, any>
  type: string
  tag: string
  func: string
  [key: string]: any

}
export interface HttpContext extends BaseContext {
  parallel?: true
  query: Record<string, any>
  params: Record<string, string>
  body: Record<string, any>
  headers: IncomingHttpHeaders
  index?: number
  data: any
}

export interface RpcContext extends BaseContext {
  send(data: any): void
  data: { tag: string; func: string; args: any[]; id: string; queue: string }
}
export interface BaseError {
  // as a symbol
  [ERROR_SYMBOL]: true
  status: number
  message: string
  description: string
}
export type BaseReturn<T> = Awaited<T> extends { toJSON(): infer R } ? R : Awaited<T>
//   export type RetOrErr<R> = { [K in keyof R]: Awaited<R[K]> | Error }

export type BaseRequestType = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options'
