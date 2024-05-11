import type { BaseRequestType } from 'phecda-server'

export function toReq(arg: RequestArgs) {
  const { body, query, method, url, headers } = arg

  return { headers, method, url, body, query }
}

export interface RequestArgs {
  body: Record<string, any>
  headers: Record<string, string>
  query: Record<string, string>
  params: Record<string, string>
  method: BaseRequestType
  url: string
  tag: string
  func: string
  args: any[]
}
