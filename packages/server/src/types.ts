import type { Request, Response } from 'express'
import type amqplib from 'amqplib'
import type { Events } from 'phecda-core'
import type { Meta } from './meta'
export type Construct<T = any> = new (...args: any[]) => T

export interface Emitter {
  on<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  once<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  off<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  removeAllListeners<N extends keyof Events>(eventName: N): void
  emit<N extends keyof Events>(eventName: N, param: Events[N]): void
}

export type RequestType = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head'

export type MergeType = <R extends Promise<any>[]> (...args: R) => { [K in keyof R]: Awaited<R[K]> }

export interface BaseError {
  error: true
  status: number
}

export interface MqContextData {
  content?: string
  message?: any
  channel?: amqplib.Channel
}

export interface ServerMergeCtx {
  request: Request
  response: Response
  meta: Record<string, Meta>
  tags?: string[]
}

export interface ServerCtx {
  request: Request
  response: Response
  meta: Meta
}
export class Base {
  context: ServerMergeCtx | ServerCtx
}

export namespace P{
  export interface Error extends BaseError { message: string; description: string}

  export type ResOrErr<R > = { [K in keyof R]: Awaited<R[K]> | Error }

  export type Res<T> = T
  export type Guard = ((contextData: ServerCtx, isMerge?: false) => Promise<boolean> | boolean) | ((contextData: ServerMergeCtx, isMerge?: true) => Promise<boolean> | boolean)
  export type Interceptor = ((contextData: ServerCtx, isMerge?: false) => any) | ((contextData: ServerMergeCtx, isMerge?: true) => any)
  export interface Handler {
    error?: (arg: any) => void
  }
  export interface Meta {
    route?: {
      type: RequestType
      route: string
    }
    mq?: {
      queue: string
      routeKey: string
      options: amqplib.Options.Consume

    }
    define?: any
    header: Record<string, string>
    params: { type: string; index: number; key: string; validate?: boolean }[]
    guards: string[]
    interceptors: string[]
    middlewares: string[]
    method: string
    name: string
    tag: string
  }
  export interface Pipe {
    transform(args: { arg: any; validate?: boolean }[], reflect: any[]): Promise<any[]>
  }
}
