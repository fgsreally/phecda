import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { MergeType, RequestType, ResOrErr, Transform } from '../types'
interface RequestArgs {
  body: Record<string, any>
  query: Record<string, string>
  params: Record<string, string>
  realParam: string
  method: RequestType
  url: string
  name: string
}
type MergedReqArg = Pick<RequestArgs, 'body' | 'query' | 'params'>
export function toReq(arg: RequestArgs) {
  const { body, query, realParam, method, url } = arg
  return { method, url, body, query: Object.keys(query).length > 0 ? `?${Object.entries(query).map(([k, v]) => `${k}=${v}`).join('&')}` : '', params: realParam }
}
// @ts-expect-error misdirction
export const merge: MergeType = (...args: RequestArgs[]) => {
  const ret = {} as Record<string, MergedReqArg>
  for (const i of args) {
    const { name, body, query, params } = i
    ret[name] = { body, query, params }
  }

  return ret
}
export type RequestMethod = <F extends (...args: any[]) => any >(fn: F, args: Parameters<F>) => Promise<ReturnType<F>>

export function createReq(instance: AxiosInstance): <R>(arg: R, config?: AxiosRequestConfig) => Promise<AxiosResponse<Awaited<R>> > {
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

export function createMergeReq(instance: AxiosInstance, key = '/__PHECDA_SERVER__'): < R extends any[]>(args: R, config?: AxiosRequestConfig) => Promise<AxiosResponse<ResOrErr<R>>> {
  // @ts-expect-error misdirction

  return (args: Record<string, MergedReqArg>, config?: AxiosRequestConfig) => {
    return instance.post(key, args, config)
  }
}

export function P<C extends new (...args: any) => any>(Model: C): Transform<C> {
  return new Model()
}
