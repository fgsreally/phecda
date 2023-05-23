import type { Events } from 'phecda-core'
import type { Ref } from 'vue'

// type ReadonlyValue<T> = {
//   readonly [K in keyof T]: K extends 'value' ? T[K] : ReadonlyValue<T[K]>
// }

export type PublicOnly<T> = {
  [K in keyof T]: T[K] extends Function
    ? T[K] // 方法不处理
    : K extends string
      ? T[K] extends ('private' | 'protected') // 如果是 private 或 protected，则删除
        ? never
        : T[K]
      : never
}

export type ReplaceInstanceValues<I> = {
  [P in keyof I]: I[P] extends (...args: any[]) => any ? I[P] : Ref<I[P]>
}

export type SchemaToObj<S> = {
  [P in keyof S]: S[P] extends object ? SchemaToObj<S[P]> : (S[P] extends string ? any : S[P]);

}

export interface PhecdaEmitter {
  on<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  off<N extends keyof Events>(eventName: N, cb?: (args: Events[N]) => void): void
  emit<N extends keyof Events>(eventName: N, param: Events[N]): void
}
