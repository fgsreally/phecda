/* eslint-disable @typescript-eslint/no-unused-vars */
export interface ServerMeta {
  route?: {
    type: RequestType
    route: string
  }
  params: { type: string; index: number; key: string; validate: boolean }[]
  guards?: string[]
  interceptors?: string[]
  method: string
  name: string
}

export type RequestType = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head'

export type MergeType = <R extends Promise<any>[]> (...args: R) => { [K in keyof R]: Awaited<R[K]> }

export type Wrap<O, T> = T

export type UnWrap<F extends Wrap<any, any>> = F extends Wrap<any, infer U> ? U : F

export type UnWrapParams<F extends (...args: any[]) => any> = {
  [K in keyof Parameters<F>]: UnWrap<Parameters<F>[K]>;
}

export type UnWrapClass<C extends new (...args: any[]) => any> = {
  [K in keyof C]: C[K] extends (...args: any[]) => any
    ? (...args: UnWrapParams<C[K]>) => ReturnType<C[K]>
    : C[K];
}

export interface PError { message: string; error: true; description: string; status: number}

export type ResOrErr<R > = { [K in keyof R]: R[K] | PError }

declare const MetaSymbol: unique symbol
export type Pmeta<T extends Record<string, any>> = T & { [MetaSymbol]: true }

export type RemoveMeta<T> = T extends [infer U, ...infer Rest]
  ? U extends Pmeta<infer R> ? RemoveMeta<Rest> : [U, ...RemoveMeta<Rest>]
  : []
