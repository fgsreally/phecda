import type { Events } from 'phecda-core'
import type { Exception } from './exception'
import type { ERROR_SYMBOL } from './common'
import { PMeta } from './meta'
export type Construct<T = any> = new (...args: any[]) => T

export interface Emitter {
  on<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  once<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  off<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  removeAllListeners<N extends keyof Events>(eventName: N): void
  emit<N extends keyof Events>(eventName: N, param: Events[N]): void
}

export type ToControllerMap<T = any> = {
  [K in keyof T]: T[K] extends (new (...args: any) => any) ? PickFunc<InstanceType<T[K]>> : void
}

export type PickKeysByValue<Type, Value> = { [Key in keyof Type]: Type[Key] extends Value ? Key : never }[keyof Type]

export type PickFunc<T> = Pick<T, PickKeysByValue<T, (...args: any) => any>>

export type RequestType = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head'

export namespace P {

  export interface BaseContext {
    meta: PMeta
    moduleMap: Record<string, any>
    parallel?: boolean
    type: string
    tag: string
    [key: string]: any
  }
  export interface Error {
    // as a symbol
    [ERROR_SYMBOL]: true
    status: number
    message: string
    description: string
  }

  export type ResOrErr<R> = { [K in keyof R]: Awaited<R[K]> | Error }

  export type Res<T> = T
  export type Guard<C extends BaseContext = any> = ((ctx: C) => Promise<boolean> | boolean)

  export type Interceptor<C extends BaseContext = BaseContext> = (ctx: C) => (any | ((ret: any) => any))

  export type Pipe<C extends BaseContext = BaseContext> = (arg: { arg: any; option?: any; key: string; type: string; index: number; reflect: any }, ctx: C) => Promise<any>
  export type Filter<C extends BaseContext = BaseContext, E extends Exception = any> = (err: E | Error, ctx?: C) => Error | any

  export interface Handler {
    error?: (arg: any) => void
  }
  export interface Meta {
    http?: {
      type: RequestType
      route: string
    }
    rpc?: {
      type: string[]
      isEvent: boolean
    }
    define?: any
    header: Record<string, string>
    params: { type: string; index: number; key: string; pipe?: string; pipeOpts?: any }[]
    guards: string[]
    filter?: string
    interceptors: string[]
    plugins: string[]
    method: string
    name: string
    tag: string
  }

}
