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

export type GetFnFromObj<O> = Pick<O, {
  [Key in keyof O]: O[Key] extends (...args: any) => any ? Key : never
}[keyof O]>

// exclude function/symbol/undefined in response obj,to make better type intelligence
export type AsyncReturnToJson<T> = ExcludeNever<{
  [Key in keyof T]: T[Key] extends (...args: any) => any ? (...args: Parameters<T[Key]>) => Promise<PickJsonData<Awaited<ReturnType<T[Key]>>>> : never
}>

export type ExcludeNotFn<T> = ExcludeNever<{
  [Key in keyof T]: T[Key] extends (...args: any) => any ? T[Key] : never
}>

export function useC<T extends new (...args: any) => any>(Module: T): ExcludeNotFn<InstanceType<T>> {
  return new Module()
}

export type PickKeysByValue<Type, Value> = { [Key in keyof Type]: Type[Key] extends Value ? Key : never }[keyof Type]

export type OmitFunction<T> = Omit<T, PickKeysByValue<T, (...args: any) => any>>
export function toClass<T>(data: OmitFunction<T>) {
  return data as T
}

export * from './axios'
