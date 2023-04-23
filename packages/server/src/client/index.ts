import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { PError, PRes, RequestType, ResOrErr } from '../types'
import { SERIES_SYMBOL } from '../common'
interface RequestArgs {
  body: Record<string, any>
  query: Record<string, string>
  params: Record<string, string>
  realParam: string
  method: RequestType
  url: string
  name: string
}
type MergedReqArg = Pick<RequestArgs, 'body' | 'query' | 'params' | 'name' >
export function toReq(arg: RequestArgs) {
  const { body, query, realParam, method, url } = arg
  return { method, url, body, query: Object.keys(query).length > 0 ? `?${Object.entries(query).map(([k, v]) => `${k}=${v}`).join('&')}` : '', params: realParam }
}

export const merge = (...args: RequestArgs[]) => {
  const ret = [] as MergedReqArg[]
  for (const i of args) {
    const { body, query, params, name } = i
    ret.push({ name, body, query, params })
  }

  return ret
}

export type RequestMethod = <F extends (...args: any[]) => any >(fn: F, args: Parameters<F>) => Promise<ReturnType<F>>

export function createReq(instance: AxiosInstance): <R>(arg: R, config?: AxiosRequestConfig) => Promise<AxiosResponse<PRes<Awaited<R>>> > {
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

export function createMergeReq(instance: AxiosInstance, key = '/__PHECDA_SERVER__'): < R extends unknown[]>(args: R, config?: AxiosRequestConfig) => Promise<AxiosResponse<ResOrErr<PRes<R>>>> {
  // @ts-expect-error misdirction
  return (args: RequestArgs[], config?: AxiosRequestConfig) => {
    return instance.post(key, merge(...args), config)
  }
}

export function isError<T = any>(data: T | PError): data is PError {
  return typeof data === 'object' && (data as any).error
}

export function $S(index: number, key = ''): any {
  return `${SERIES_SYMBOL}@${index}@${key}`
}
