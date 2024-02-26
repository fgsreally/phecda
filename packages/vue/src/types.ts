import type { Events } from 'phecda-core'
import type { App, Ref } from 'vue'

// type ReadonlyValue<T> = {
//   readonly [K in keyof T]: K extends 'value' ? T[K] : ReadonlyValue<T[K]>
// }

export type ReplaceInstanceValues<I> = {
  [P in keyof I]: I[P] extends (...args: any[]) => any ? I[P] : Ref<I[P]>
}

export type SchemaToObj<S> = {
  [P in keyof S]: S[P] extends object ? SchemaToObj<S[P]> : (S[P] extends string ? any : S[P]);

}

export interface PhecdaInstance {
  useOMap: Map<any, any>
  useVMap: WeakMap<any, any>
  useRMap: WeakMap<any, any>
  fnMap: WeakMap<any, any>
  computedMap: WeakMap<any, any>
  app: App
}

export interface PhecdaEmitter {
  on<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  off<N extends keyof Events>(eventName: N, cb?: (args: Events[N]) => void): void
  emit<N extends keyof Events>(eventName: N, param: Events[N]): void
}

export type Plugin = (instance: PhecdaInstance) => void
