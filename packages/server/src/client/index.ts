import { toReq } from './server'
export * from './server'

export function createBeacon(baseUrl: string) {
  return (arg: any) => {
    const { url, params, query, body } = toReq(arg as any)

    navigator.sendBeacon(`${baseUrl}${url}${params}${query}`, JSON.stringify(body))
  }
}
