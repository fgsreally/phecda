import type { OmitFunction } from 'phecda-server'

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

export function toClass<T>(data: OmitFunction<T>) {
  return data as T
}

// export type ExcludeNever<T> = { [K in keyof T as T[K] extends never ? never : K]: T[K] }
// export type PickJsonData<T> = ExcludeNever<T extends object | any[]
//   ? {
//       [K in keyof T]: T[K] extends ((...args: any[]) => any) | Symbol | undefined ? never : PickJsonData<T[K]>;
//     }
//   : T>

// // exclude function/symbol/undefined in response obj,to make better type intelligence
// export type AsyncReturnToJson<T> = ExcludeNever<{
//   [Key in keyof T]: T[Key] extends (...args: any) => any ? (...args: Parameters<T[Key]>) => Promise<PickJsonData<Awaited<ReturnType<T[Key]>>>> : never
// }>
