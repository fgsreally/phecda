import type { Events } from 'phecda-core'
import type { Exception } from './exception'
export type Construct<T = any> = new (...args: any[]) => T

export interface Emitter {
  on<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  once<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  off<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  removeAllListeners<N extends keyof Events>(eventName: N): void
  emit<N extends keyof Events>(eventName: N, param: Events[N]): void
}

export type ToInstance<T = any> = {
  [K in keyof T]: T[K] extends (new (...args: any) => any) ? InstanceType<T[K]> : void
}

export type RequestType = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head'

export type MergeType = <R extends Promise<any>[]> (...args: R) => { [K in keyof R]: Awaited<R[K]> }

// export interface ServerMergeCtx {
//   request: Request
//   response: Response
//   meta: Record<string, Meta>
//   moduleMap: Record<string, any>
//   isMerge: true
//   tags?: string[]
// }

export interface ServerErr { message: string; description: string; status: number; error: boolean }

export interface BaseError {
  error: true
  status: number
}

export namespace P {
  export interface Error extends BaseError { message: string; description: string }

  export type ResOrErr<R> = { [K in keyof R]: Awaited<R[K]> | Error }

  export type Res<T> = T
  export type Guard<C = any> = ((tag: string, ctx: C) => Promise<boolean> | boolean)

  export type Interceptor<C = any> = (tag: string, ctx: C) =>(any | ((ret: any) => any))

  export type Pipe<C = any> = (arg: { arg: any; option?: any; key: string; type: string; index: number; reflect: any }, tag: string, ctx: C) => Promise<any>
  export type Filter<C = any, R = any, E extends Exception = any > = (err: E | Error, tag?: string, ctx?: C) => R | Promise<R>

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
    interceptors: string[]
    plugins: string[]
    method: string
    name: string
    tag: string
  }

}
