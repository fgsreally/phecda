import type { Construct, Events } from 'phecda-core'
import type { ControllerMeta } from './meta'
import type { ERROR_SYMBOL } from './common'
export interface Emitter {
  on<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  once<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  off<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  removeAllListeners<N extends keyof Events>(eventName: N): void
  emit<N extends keyof Events>(eventName: N, param: Events[N]): void
}

type AnyFunction = (...args: any) => any
type ParseInstance<Instance extends Record<string, AnyFunction>> = {
  [Key in keyof Instance]: ToClientFn<Instance[Key]>
}
type PickFuncKeys<Type> = { [Key in keyof Type]: Type[Key] extends (...args: any) => any ? (ReturnType<Type[Key]> extends CustomResponse<any> ? never : Key) : never }[keyof Type]

export type ToClientMap<ControllerMap extends Record<string, Construct>> = {
  [Key in keyof ControllerMap]: ToClientInstance<InstanceType<ControllerMap[Key]>>
}

export type ToClientInstance<Instance extends Record<string, any>> = ParseInstance<PickFunc<Instance>>

export type ToClientFn<Func extends AnyFunction> = (...p: Parameters<Func>) => Promise<BaseReturn<ReturnType<Func>>>

export type PickFunc<Instance> = Pick<Instance, PickFuncKeys<Instance>>

export type OmitFunction<Instance> = Omit<Instance, PickFuncKeys<Instance>>

export interface BaseContext {
  meta: ControllerMeta
  moduleMap: Record<string, any>
  type: string
  tag: string
  func: string
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
export type BaseReturn<T> = Awaited<T> extends { toJSON(): infer R } ? R : Awaited<T>
//   export type RetOrErr<R> = { [K in keyof R]: Awaited<R[K]> | Error }

export type BaseRequestType = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options'

const ResponseSymbol: unique symbol = Symbol('response')

export class CustomResponse<Value> {
  [ResponseSymbol]: Value
}

export type ExtractResponse<Class extends CustomResponse<any>> = Class extends CustomResponse<infer Value> ? Value : never
