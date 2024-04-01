import type { PHECDA_KEY } from './core'

export interface NameSpace {
  [name: string]: Phecda
}

export interface InjectData {
  [key: string]: any

}

export type Construct<T = any> = new (...args: any[]) => T
// 需要实例化的功能只考虑Construct,仅用于与实例化无关or无后续操作的功能
export type AbConstruct<T = any> = abstract new (...args: any[]) => T

export interface Handler {
  [key: string]: any
  // init?: (instance: any) => any
  // pipe?: (instance: any) => void
  // rule?: RegExp | string | Function | number
  // info?: string
  // meta?: any
  // error?: any
  // http?: any
}
export interface Phecda {
  prototype: any
  [PHECDA_KEY]: {

    __EXPOSE_VAR__: Set<PropertyKey>

    __IGNORE_VAR__: Set<PropertyKey>

    __STATE_VAR__: Set<PropertyKey>

    __STATE_HANDLER__: Map<PropertyKey, Handler[]>

    __STATE_NAMESPACE__: Map<PropertyKey, Object>

    [key: string]: any
  }
}

export type ClassValue<I> = {
  [P in keyof I]: I[P] extends Function ? undefined : I[P];
}

export interface Events {

}
