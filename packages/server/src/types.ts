import type { Events } from 'phecda-core'
import type { P } from './namespace'
export { P }
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

export type ToClientFn<T extends (...args: any) => any> = (...p: Parameters<T>) => Promise<P.Ret<ReturnType<T>>>

type PickKeysByValue<Type, Value> = { [Key in keyof Type]: Type[Key] extends Value ? Key : never }[keyof Type]

export type PickFunc<T> = Pick<T, PickKeysByValue<T, (...args: any) => any>>
export type OmitFunction<T> = Omit<T, PickKeysByValue<T, (...args: any) => any>>
