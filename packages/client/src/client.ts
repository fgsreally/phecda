import type { Construct, ToClientMap } from 'phecda-server'

import { isError } from './helper'

export type RequestArg = {
  method: string
  url: string
  query: Record<string, string>
  body?: any
  headers: Record<string, string>
  params: Record<string, string>
} & Record<string, any>

const rawFetch = async ({ url, method, body, headers, query }: RequestArg) => {
  const queryStr = Object.entries(query).map(([k, v]) => `${k}=${v}`).join('&')

  const res = await fetch(`${url}${queryStr ? `?${queryStr}` : ''}`, {
    method,
    body,
    headers: new Headers(headers),

  })

  if (res.headers.get('Content-Type') === 'application/json')
    return res.json()

  return res.text()
}

export function createClient<Controllers extends Record<string, Construct>>(controllers: Controllers, options: {
  fetch?: (arg: RequestArg) => Promise<any>
  batch?: boolean
  parallelRoute?: string
} = {}): ToClientMap<Controllers> {
  const client: any = {

  }
  let batchStack: any[] | null
  let batchPromise: any
  let isFinish = true
  const { batch, fetch = rawFetch, parallelRoute } = options

  for (const key in controllers) {
    const proxy = new Proxy(new controllers[key](), {
      get(target: any, p) {
        const generator = target[p]
        if (typeof generator !== 'function')
          throw new Error(`'${p as string}' on controller must be a function !`)
        return async (...args: any) => {
          const requestArg = generator(...args)

          for (const i in requestArg.params)
            requestArg.url = requestArg.url.replace(`{{${i}}}`, requestArg.params[i])

          if (!batch) {
            return fetch(requestArg)
          }
          else {
            let index: number

            if (!isFinish)
              await batchPromise

            if (!batchStack) {
              index = 0
              batchStack = [requestArg]
              // eslint-disable-next-line no-async-promise-executor
              batchPromise = new Promise(async (resolve) => {
                await Promise.resolve()
                isFinish = false
                const data = await fetch({
                  body: batchStack,
                  url: parallelRoute || '/__PHECDA_SERVER__',
                  method: 'post',
                  query: {},
                  params: {},
                  headers: {},
                })
                isFinish = true
                batchStack = []
                resolve(data)
                batchPromise = undefined
              })
            }
            else {
              index = batchStack.push(requestArg) - 1
            }
            return new Promise((resolve, reject) => {
              batchPromise.then((data: any[]) => {
                batchStack = null
                const ret = data[index]

                if (isError(ret))
                  reject(ret)

                else
                  resolve(ret)
              })
            })
          }
        }
      },
    })
    client[key] = proxy
  }
  return client
}
