export type Construct<T = any> = new (...args: any[]) => T

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

// export type OmitFunction<Instance> = Omit<Instance, PickFuncKeys<Instance>>

// export function toClass<T>(data: OmitFunction<T>) {
//   return data as T
// }

type AnyFunction = (...args: any) => any

export type BaseReturn<T> = T extends { toJSON(): infer R } ? R :T
export type HttpClientFn<Func extends AnyFunction> = (...p: Parameters<Func>) => Promise<BaseReturn<Awaited<ReturnType<Func>>>> & { send: () => void; abort: () => void }
export type RpcClientFn<Func extends AnyFunction> = (...p: Parameters<Func>) => Promise<BaseReturn<Awaited<ReturnType<Func>>>> & { send: () => void }

type PickFunc<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => (infer R) ? (Awaited<R> extends { _ps_response: any } ? never : (
    K
  )) : never]: T[K]
};

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
