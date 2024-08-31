import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { BaseError, ToClientInstance } from 'phecda-server'
import type { RequestArgs } from './helper'
import { toReq } from './helper'

export function createBeacon(baseUrl: string) {
  return (arg: any) => {
    const { url, body } = toReq(arg as any)

    navigator.sendBeacon(`${baseUrl}${url}`, JSON.stringify(body))
  }
}

export function createReq(instance: AxiosInstance): <R>(arg: R, config?: AxiosRequestConfig) => Promise<AxiosResponse<Awaited<R>>> {
  return (arg: any, config?: AxiosRequestConfig) => {
    const { url, body, method, headers, query } = toReq(arg as RequestArgs)
    if (!method)
      throw new Error('methods without route decorator won\'t send request')

    return instance.request({
      url,
      method,
      params: query,
      data: body,
      headers,
      ...config,
    })
  }
}

export function createParallelReq(instance: AxiosInstance, route = '/__PHECDA_SERVER__'): < R extends unknown[]>(args: R, config?: AxiosRequestConfig) => Promise<AxiosResponse<{
  [K in keyof R]: Awaited<R[K]> | BaseError
}>> {
  // @ts-expect-error misdirction
  return (args: RequestArgs[], config?: AxiosRequestConfig) => {
    return instance.post(route, args, config)
  }
}

export function isError<T = any>(data: T | BaseError): data is BaseError {
  return typeof data === 'object' && data !== null && (data as any).__PS_ERROR__
}

export function useC<T extends new (...args: any) => any>(Module: T): ToClientInstance<InstanceType<T>> {
  return new Module()
}
