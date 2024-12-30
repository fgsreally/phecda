import type { Alova, Method } from 'alova'

import { HttpAdaptor, RequestArg } from './client'
export function alovaAdaptor(instance: Alova<any>): HttpAdaptor {
  return () => {
    let m: Method
    return {
      send: async ({ url, method, body, query, headers }: RequestArg) => {
        const { Method } = await import('alova')

        m = new Method(method.toUpperCase() as any, instance, url, {
          params: query,
          headers,
        }, ['get', 'head'].includes(method) ? undefined : body)

        return m.send()
      },
      abort: () => {
        m.abort()
      },
    }
  }
}
