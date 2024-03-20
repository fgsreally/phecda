import { markRaw as Raw } from 'vue'
import type { Ref } from 'vue'

// type ReadonlyValue<T> = {
//   readonly [K in keyof T]: K extends 'value' ? T[K] : ReadonlyValue<T[K]>
// }
declare const RawSymbol: unique symbol

export type ReplaceInstanceValues<I> = {
  // @todo handle markRaw types
  [P in keyof I]: I[P] extends (...args: any[]) => any ? I[P] : I[P] extends {
    [RawSymbol]: true
  } ? I[P] : Ref<I[P]>
}

export type SchemaToObj<S> = {
  [P in keyof S]: S[P] extends object ? SchemaToObj<S[P]> : (S[P] extends string ? any : S[P]);

}

export function markRaw<T extends object>(value: T): T & {
  [RawSymbol]: true
} {
  return Raw(value) as any
}
