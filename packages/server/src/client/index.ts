interface PhecdaRequest {
  body: Record<string, any>
  query: Record<string, string>
  params: Record<string, string>
  realParam: string
}
export function toReq(arg: PhecdaRequest) {
  const { body, query, realParam } = arg
  return { body, query: Object.keys(query).length > 0 ? `?${Object.entries(query).map(([k, v]) => `${k}=${v}`).join('&')}` : '', params: realParam }
}

export function mergeReq(arg: PhecdaRequest) {
  const { body, query, params } = arg
  return { body, query, params }
}
