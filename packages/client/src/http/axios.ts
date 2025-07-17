import type { AxiosInstance } from 'axios'
import { HttpAdaptor, RequestArg } from './client'
export function adaptor(instance?: AxiosInstance): HttpAdaptor {
  return () => {
    let controller: AbortController

    return {
      send: async ({ http: { method, url }, body, query, headers, file, files }: RequestArg) => {
        const { default: axios } = await import('axios')

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

        controller = new AbortController()
        const { signal } = controller
        const { data } = await (instance || axios).request({
          data: body,
          url,
          method,
          params: query,
          headers,
          signal,
        })
        return data
      },
      abort: () => {
        controller.abort()
      },
    }
  }
}
