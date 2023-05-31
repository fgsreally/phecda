import { toReq } from './axios'

export function createBeacon(baseUrl: string) {
  return (arg: any) => {
    const { url, params, query, body } = toReq(arg as any)

    navigator.sendBeacon(`${baseUrl}${url}${params}${query}`, JSON.stringify(body))
  }
}

export function useC<T extends new (...args: any) => any>(Module: T): InstanceType<T> {
  return new Module()
}

export * from './axios'
export * from './compiler'
