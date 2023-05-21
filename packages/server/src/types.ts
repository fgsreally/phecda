import type { Request, Response } from 'express'
import type amqplib from 'amqplib'
import type { Events } from 'phecda-core'
import type { Wrap } from './utils'
import type { Pmeta } from './meta'
export type Construct<T = any> = new (...args: any[]) => T

export interface Emitter {
  on<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  once<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  off<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  removeAllListeners<N extends keyof Events>(eventName: N): void
  emit<N extends keyof Events>(eventName: N, param: Events[N]): void
}
export interface PHandler {
  error?: (arg: any) => void
}
export interface ServerMeta {
  route?: {
    type: RequestType
    route: string
  }
  mq?: {
    queue: string
    routeKey: string
    options: amqplib.Options.Consume

  }
  meta?: any
  header: Record<string, string>
  params: { type: string; index: number; key: string; validate?: boolean }[]
  guards: string[]
  interceptors: string[]
  middlewares: string[]
  method: string
  name: string
  tag: string
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

export interface ServerContextData {
  request?: Request<any, any, any, any, Record<string, any>>
  response?: Response<any, Record<string, any>>

}

export interface MqContextData {
  content?: string
  message?: any
  channel?: amqplib.Channel
}

export interface ContextData {
  request: Request
  response: Response
  meta: Pmeta
}
export class Base {
  context: ContextData
}
