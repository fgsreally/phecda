import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { RequestArg } from './client'
export function axiosFetch(instance?: AxiosInstance) {
  return async ({ url, method, body, query, headers }: RequestArg) => {
    const { data } = await (instance || axios).request({
      data: body,
      url,
      method,
      params: query,
      headers,
    })

    return data
  }
}
