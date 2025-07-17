import type { Events } from 'phecda-core'
import type { ControllerMeta } from './meta'
import type { ERROR_SYMBOL } from './common'
export interface Emitter {
  on<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  once<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  off<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  removeAllListeners<N extends keyof Events>(eventName: N): void
  emit<N extends keyof Events>(eventName: N, param: Events[N]): void
}

export interface BaseCtx {
  meta: ControllerMeta
  moduleMap: Record<string, any>
  type: string
  tag: string
  method: string
  category: string
  [key: string]: any

}

export interface DefaultOptions {
  globalGuards?: string[]
  globalFilter?: string
  globalPipe?: string
  globalAddons?: string[]
}

export interface BaseError {
  // as a symbol
  [ERROR_SYMBOL]: true
  status: number
  message: string
  description: string
}
//   export type RetOrErr<R> = { [K in keyof R]: Awaited<R[K]> | Error }

export type BaseRequestMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options'

export class CustomResponse<Value> {
  _ps_response: Value
}

export type ExtractResponse<Class extends CustomResponse<any>> = Class extends CustomResponse<infer Value> ? Value : never
