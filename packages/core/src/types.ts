import type { EventType } from 'mitt'
import type { Ref } from 'vue'
import type { Phecda } from './model'
export interface PhecdaNameSpace {
  [name: string]: Phecda
}

export interface PhecdaEvents extends Record<EventType, unknown> {
  [key: EventType]: any
}

export interface UsePipeOptions {
  transform: boolean
  collectError: boolean
}

export interface PhecdaHandler {
  init?: (instance: Phecda, isFirstTime: boolean) => any
  validate?: (instance: Phecda,) => string | void
  pipe?: (instance: Phecda,) => void
  error?: any
  watch?: any
  rule?: any
  info?: any
  ignore?: boolean
  meta?: any
  beforeUnload?: (instance: Phecda) => any
  beforeLoad?: (instance: Phecda, v: any) => any
}

export type Vret<I> = {
  [P in keyof I]: I[P] extends Function ? I[P] : Ref<I[P]>;
}

export type ClassValue<I> = {
  [P in keyof I]: I[P] extends Function ? undefined : I[P];
}

export type SchemaToObj<S> = {
  [P in keyof S]: S[P] extends object ? SchemaToObj<S[P]> : (S[P] extends string ? any : S[P]);

}
