import type { PickFunc, PickKeysByValue } from 'phecda-server'
import { toReq } from './axios'
export function createBeacon(baseUrl: string) {
  return (arg: any) => {
    const { url, body } = toReq(arg as any)

    navigator.sendBeacon(`${baseUrl}${url}`, JSON.stringify(body))
  }
}

export type ExcludeNever<T> = { [K in keyof T as T[K] extends never ? never : K]: T[K] }

export type PickJsonData<T> = ExcludeNever<T extends object | any[]
  ? {
      [K in keyof T]: T[K] extends ((...args: any[]) => any) | Symbol | undefined ? never : PickJsonData<T[K]>;
    }
  : T>

// exclude function/symbol/undefined in response obj,to make better type intelligence
export type AsyncReturnToJson<T> = ExcludeNever<{
  [Key in keyof T]: T[Key] extends (...args: any) => any ? (...args: Parameters<T[Key]>) => Promise<PickJsonData<Awaited<ReturnType<T[Key]>>>> : never
}>

export function useC<T extends new (...args: any) => any>(Module: T): PickFunc<InstanceType<T>> {
  return new Module()
}

export type OmitFunction<T> = Omit<T, PickKeysByValue<T, (...args: any) => any>>
export function toClass<T>(data: OmitFunction<T>) {
  return data as T
}

export type Expand<T> = T extends (...args: infer A) => infer R
  ? (...args: Expand<A>) => Expand<R>
  : T extends infer O
    ? { [K in keyof O]: O[K] }
    : never

export type ExpandRecursively<T> = T extends (...args: infer A) => infer R
  ? (...args: ExpandRecursively<A>) => ExpandRecursively<R>
  : T extends object
    ? T extends infer O
      ? { [K in keyof O]: ExpandRecursively<O[K]> }
      : never
    : T

export * from './axios'
