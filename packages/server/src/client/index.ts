import axios from 'axios'
interface RequestArgs {
  body: Record<string, any>
  query: Record<string, string>
  params: Record<string, string>
  realParam: string
  method: string
}
export function toReq(arg: RequestArgs) {
  const { body, query, realParam } = arg
  return { body, query: Object.keys(query).length > 0 ? `?${Object.entries(query).map(([k, v]) => `${k}=${v}`).join('&')}` : '', params: realParam }
}

export function mergeReq(arg: RequestArgs) {
  const { body, query, params } = arg
  return { body, query, params }
}

export type RequestMethod = <F extends (...args: any[]) => any >(fn: F, ...args: Parameters<F>) => Promise<ReturnType<F>>

export function createAxios(instance: AxiosInstance): RequestMethod {
  const ret = fn(...args) as RequestArgs
  return () => {
   return  axios[ret.method]()
  } as unknoew
}
