import { toReq } from './axios'
export * from './axios'

export function createBeacon(baseUrl: string) {
  return (arg: any) => {
    const { url, params, query, body } = toReq(arg as any)

    navigator.sendBeacon(`${baseUrl}${url}${params}${query}`, JSON.stringify(body))
  }
}
