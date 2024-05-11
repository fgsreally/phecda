import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { P, ToClientInstance } from 'phecda-server'
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
      throw new Error ('methods without route decorator won\'t send request')

    const ret = [url] as any[]

    if (Object.keys(body).length > 0)
      ret.push(body)

    ret.push(addToConfig(config, { headers, params: query }))
    // @ts-expect-error misdirction
    return instance[method](...ret)
  }
}

export function createParallelReq(instance: AxiosInstance, route = '/__PHECDA_SERVER__'): < R extends unknown[]>(args: R, config?: AxiosRequestConfig) => Promise<AxiosResponse<{
  [K in keyof R]: Awaited<R[K]> | P.Error
}>> {
  // @ts-expect-error misdirction
  return (args: RequestArgs[], config?: AxiosRequestConfig) => {
    return instance.post(route, args, config)
  }
}

export function isError<T = any>(data: T | P.Error): data is P.Error {
  return typeof data === 'object' && (data as any).__PS_ERROR__
}

export function useC<T extends new (...args: any) => any>(Module: T): ToClientInstance<InstanceType<T>> {
  return new Module()
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

// // work for vue-request
// // phecda-client request instance + method from class => async function
// export function toAsync<F extends (...args: any) => any>(pcRequest: ReturnType<typeof createReq>, cb: F): (...params: Parameters<F>) => ReturnType<F> {
//   // @ts-expect-error misdirct
//   return async (...params: Parameters<F>) => {
//     return (await pcRequest(cb(...params as any))).data as any
//   }
// }

// type MergedReqArg = Pick<RequestArgs, 'body' | 'query' | 'params' | 'tag' | 'headers'>

//  const merge = (...args: RequestArgs[]) => {
//   const ret = [] as MergedReqArg[]
//   for (const i of args) {
//     const { body, query, params, tag, headers } = i
//     ret.push({ tag, body, query, params, headers })
//   }

//   return ret
// }

//  type RequestMethod = <F extends (...args: any[]) => any >(fn: F, args: Parameters<F>) => Promise<ReturnType<F>>
