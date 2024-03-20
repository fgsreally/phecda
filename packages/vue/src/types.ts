import type { Raw, Ref } from 'vue'

// type ReadonlyValue<T> = {
//   readonly [K in keyof T]: K extends 'value' ? T[K] : ReadonlyValue<T[K]>
// }

export type ReplaceInstanceValues<I> = {
  [P in keyof I]: I[P] extends (...args: any[]) => any ? I[P] : I[P] extends Raw<any> ? I[P] : Ref<I[P]>
}

export type SchemaToObj<S> = {
  [P in keyof S]: S[P] extends object ? SchemaToObj<S[P]> : (S[P] extends string ? any : S[P]);

}
