import type { Alova, Method } from 'alova'

import { HttpAdaptor, RequestArg } from './client'
export function adaptor(instance: Alova<any>): HttpAdaptor {
  return () => {
    let m: Method
    return {
      send: async ({ http: { method, url }, body, query, headers, file, files }: RequestArg) => {
        const { Method } = await import('alova')

        if (file) {
          const formData = new FormData()
          formData.append('file', file)
          body = formData
        }
        if (files) {
          const formData = new FormData()
          files.forEach((file: any) => {
            formData.append('files', file)
          })
          body = formData
        }

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
