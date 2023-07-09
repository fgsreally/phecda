import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { P, RequestType } from 'phecda-server'
import { SERIES_SYMBOL } from './common'

interface RequestArgs {
  body: Record<string, any>
  query: Record<string, string>
  params: Record<string, string>
  realParam: string
  method: RequestType
  url: string
  tag: string
}
type MergedReqArg = Pick<RequestArgs, 'body' | 'query' | 'params' | 'tag' >
export function toReq(arg: RequestArgs) {
  const { body, query, realParam, method, url } = arg
  return { method, url, body, query: Object.keys(query).length > 0 ? `?${Object.entries(query).map(([k, v]) => `${k}=${v}`).join('&')}` : '', params: realParam }
}

export const merge = (...args: RequestArgs[]) => {
  const ret = [] as MergedReqArg[]
  for (const i of args) {
    const { body, query, params, tag } = i
    ret.push({ tag, body, query, params })
  }

  return ret
}

export type RequestMethod = <F extends (...args: any[]) => any >(fn: F, args: Parameters<F>) => Promise<ReturnType<F>>

export function createReq(instance: AxiosInstance): <R>(arg: R, config?: AxiosRequestConfig) => Promise<AxiosResponse<P.Res<Awaited<R>>> > {
  // @ts-expect-error methods without route decorator won't send request
  return (arg: any, config?: AxiosRequestConfig) => {
    const { url, params, query, body, method } = toReq(arg as RequestArgs)
    if (!method) {
      console.warn('methods without route decorator won\'t send request')
      return
    }

    const ret = [`${url}${params}${query}`] as any[]
    body && ret.push(body)
    config && ret.push(config)
    // @ts-expect-error misdirction
    return instance[method](...ret)
  }
}

export function createSeriesReq(instance: AxiosInstance, key = '/__PHECDA_SERVER__'): < R extends unknown[]>(args: R, config?: AxiosRequestConfig) => Promise<AxiosResponse<P.ResOrErr<P.Res<R>>>> {
  // @ts-expect-error misdirction
  return (args: RequestArgs[], config?: AxiosRequestConfig) => {
    return instance.post(key, {
      category: 'series',
      data: merge(...args),
    }, config)
  }
}

export function createParallelReq(instance: AxiosInstance, key = '/__PHECDA_SERVER__'): < R extends unknown[]>(args: R, config?: AxiosRequestConfig) => Promise<AxiosResponse<P.ResOrErr<P.Res<R>>>> {
  // @ts-expect-error misdirction
  return (args: RequestArgs[], config?: AxiosRequestConfig) => {
    return instance.post(key, {
      category: 'parallel',
      data: merge(...args),
    }, config)
  }
}

export function isError<T = any>(data: T | P.Error): data is P.Error {
  return typeof data === 'object' && (data as any).error
}

export function $S(index: number, key = ''): any {
  return `${SERIES_SYMBOL}@${index}@${key}`
}

// work for vue-request
// phecda-client request instance + method from class => async function
export function toAsync<F extends (...args: any) => any>(pcRequest: ReturnType<typeof createReq>, cb: F) {
  return async (...params: Parameters<F>) => {
    return (await pcRequest(cb(...params as any) as ReturnType<F>)).data
  }
}
