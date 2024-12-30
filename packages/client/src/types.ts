import type { Construct, CustomResponse } from 'phecda-server'

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

export type OmitFunction<Instance> = Omit<Instance, PickFuncKeys<Instance>>

export function toClass<T>(data: OmitFunction<T>) {
  return data as T
}

type AnyFunction = (...args: any) => any

export type BaseReturn<T> = Awaited<T> extends { toJSON(): infer R } ? R : Awaited<T>
export type HttpClientFn<Func extends AnyFunction> = (...p: Parameters<Func>) => Promise<BaseReturn<ReturnType<Func>>> & { send: () => void; abort: () => void }
export type RpcClientFn<Func extends AnyFunction> = (...p: Parameters<Func>) => Promise<BaseReturn<ReturnType<Func>>> & { send: () => void }

type PickFuncKeys<Type> = { [Key in keyof Type]: Type[Key] extends (...args: any) => any ? (ReturnType<Type[Key]> extends CustomResponse<any> ? never : Key) : never }[keyof Type]
type PickFunc<Instance> = Pick<Instance, PickFuncKeys<Instance>>
type ParseHttpInstance<Instance extends Record<string, AnyFunction>> = {
  [Key in keyof Instance]: HttpClientFn<Instance[Key]>
}

export type HttpClientMap<ControllerMap extends Record<string, Construct>> = {
  [Key in keyof ControllerMap]: ParseHttpInstance<PickFunc<InstanceType<ControllerMap[Key]>>>
}

type ParseRpcInstance<Instance extends Record<string, AnyFunction>> = {
  [Key in keyof Instance]: RpcClientFn<Instance[Key]>
}

export type RpcClientMap<ControllerMap extends Record<string, Construct>> = {
  [Key in keyof ControllerMap]: ParseRpcInstance<PickFunc<InstanceType<ControllerMap[Key]>>>
}
