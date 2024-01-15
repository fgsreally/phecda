import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { P, RequestType } from 'phecda-server'

export interface RequestArgs {
  body: Record<string, any>
  headers: Record<string, string>
  query: Record<string, string>
  params: Record<string, string>
  method: RequestType
  url: string
  tag: string
  args: any[]
}
type MergedReqArg = Pick<RequestArgs, 'body' | 'query' | 'params' | 'tag' | 'headers'>
export function toReq(arg: RequestArgs) {
  const { body, query, method, url, headers } = arg

  return { headers, method, url, body, query }
}

export const merge = (...args: RequestArgs[]) => {
  const ret = [] as MergedReqArg[]
  for (const i of args) {
    const { body, query, params, tag, headers } = i
    ret.push({ tag, body, query, params, headers })
  }

  return ret
}

export type RequestMethod = <F extends (...args: any[]) => any >(fn: F, args: Parameters<F>) => Promise<ReturnType<F>>

export function createReq(instance: AxiosInstance): <R>(arg: R, config?: AxiosRequestConfig) => Promise<AxiosResponse<P.Res<Awaited<R>>>> {
  // @ts-expect-error methods without route decorator won't send request
  return (arg: any, config?: AxiosRequestConfig) => {
    const { url, body, method, headers, query } = toReq(arg as RequestArgs)
    if (!method) {
      console.warn('methods without route decorator won\'t send request')
      return
    }

    const ret = [url] as any[]

    if (Object.keys(body).length > 0)
      ret.push(body)

    ret.push(addToConfig(config, { headers, params: query }))
    // @ts-expect-error misdirction
    return instance[method](...ret)
  }
}

export function createParallelReq(instance: AxiosInstance, key = '/__PHECDA_SERVER__'): < R extends unknown[]>(args: R, config?: AxiosRequestConfig) => Promise<AxiosResponse<P.ResOrErr<P.Res<R>>>> {
  // @ts-expect-error misdirction
  return (args: RequestArgs[], config?: AxiosRequestConfig) => {
    return instance.post(key, args, config)
  }
}

export function isError<T = any>(data: T | P.Error): data is P.Error {
  return typeof data === 'object' && (data as any).__PS_ERROR__
}

// work for vue-request
// phecda-client request instance + method from class => async function
export function toAsync<F extends (...args: any) => any>(pcRequest: ReturnType<typeof createReq>, cb: F): (...params: Parameters<F>) => ReturnType<F> {
  // @ts-expect-error misdirct
  return async (...params: Parameters<F>) => {
    return (await pcRequest(cb(...params as any))).data as any
  }
}

function addToConfig(origin: any, config: Record<string, any>) {
  if (origin) {
    for (const key in config)
      origin[key] = config[key]
  }
  else {
    origin = config
  }
  return origin
}
