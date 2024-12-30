import type { AxiosInstance } from 'axios'
import { HttpAdaptor, RequestArg } from './client'
export function axiosAdaptor(instance?: AxiosInstance): HttpAdaptor {
  return () => {
    let controller: AbortController

    return {
      send: async ({ url, method, body, query, headers }: RequestArg) => {
        const { default: axios } = await import('axios')

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
