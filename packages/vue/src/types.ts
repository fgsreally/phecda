import type { EventType } from 'mitt'
import type { Ref } from 'vue'
export type Vret<I> = {
  [P in keyof I]: I[P] extends Function ? I[P] : Ref<I[P]>;
}

export type SchemaToObj<S> = {
  [P in keyof S]: S[P] extends object ? SchemaToObj<S[P]> : (S[P] extends string ? any : S[P]);

}

export interface PhecdaEvents extends Record<EventType, unknown> {
  [key: EventType]: any
}
