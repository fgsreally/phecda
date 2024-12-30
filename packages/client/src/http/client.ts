import type { Construct } from 'phecda-server'
import type { HttpClientMap } from '../types'
import { isError } from '../helper'
import { HttpRequest } from '../utils'

export type RequestArg = {
  method: string
  url: string
  query: Record<string, string>
  body?: any
  headers: Record<string, string>
  params: Record<string, string>
} & Record<string, any>

const fetchAdaptor: HttpAdaptor = () => {
  let controller: AbortController

  return {
    async send({ url, method, body, headers, query }: RequestArg) {
      const queryStr = Object.entries(query).map(([k, v]) => `${k}=${v}`).join('&')
      controller = new AbortController()
      const { signal } = controller
      const res = await fetch(`${url}${queryStr ? `?${queryStr}` : ''}`, {
        method,
        body,
        headers: new Headers(headers),
        signal,
      })

      if (res.headers.get('Content-Type') === 'application/json')
        return res.json()

      return res.text()
    },
    abort: () => {
      controller.abort()
    },
  }
}

export type HttpAdaptor = () => {
  send: (arg: RequestArg) => Promise<any>
  abort: () => void
}
function nextTick() {
  return Promise.resolve()
}

export function createClient<Controllers extends Record<string, Construct>>(controllers: Controllers, adaptor: HttpAdaptor = fetchAdaptor,
  options: {
    batch?: boolean
    parallelRoute?: string
  } = {}): HttpClientMap<Controllers> {
  const client: any = {

  }
  let batchStack: any[] | null
  let batchPromise: any
  const { batch, parallelRoute } = options

  for (const key in controllers) {
    const proxy = new Proxy(new controllers[key](), {
      get(target: any, p) {
        const generator = target[p]
        if (typeof generator !== 'function')
          throw new Error(`'${p as string}' on controller must be a function !`)
        return (...args: any) => {
          const requestArg = generator(...args)

          for (const i in requestArg.params)
            requestArg.url = requestArg.url.replace(`{{${i}}}`, requestArg.params[i])
          if (!batch) {
            const { send, abort } = adaptor()
            return HttpRequest(() => send(requestArg), abort)
          }
          else {
            let index: number
            const { send } = adaptor()

            return HttpRequest(() => {
              if (!batchStack) {
                batchStack = []
                batchPromise = nextTick().then(() => {
                  if (batchStack!.filter((item: any) => item !== null).length === 0)
                    return null

                  const body = batchStack
                  batchStack = null
                  return send({
                    body,
                    url: parallelRoute || '/__PHECDA_SERVER__',
                    method: 'post',
                    query: {},
                    params: {},
                    headers: {},
                  })
                },
                )
              }
              index = batchStack!.push(requestArg) - 1

              return new Promise((resolve, reject) => {
                batchPromise.then((data: any[]) => {
                  if (data === null)
                    return

                  const ret = data[index]

                  if (isError(ret))
                    reject(ret)

                  else
                    resolve(ret)
                })
              })
            }, () => {
              if (batchStack)
                batchStack.splice(index, 1, null)

              throw new Error('abort')
            })

            // return new Promise((resolve, reject) => {
            //   batchPromise.then((data: any[]) => {
            //     batchStack = null
            //     const ret = data[index]

            //     if (isError(ret))
            //       reject(ret)

            //     else
            //       resolve(ret)
            //   })
            // })//x1_x2_resolve_x3
            //
          }
        }
      },
    })
    client[key] = proxy
  }
  return client
}
