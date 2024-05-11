import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import type { ToClientMap } from 'phecda-server'
import { createParallelReq, createReq, isError, useC } from './base'

 type ChainRequester<T extends Record<string, any>> = ToClientMap<T> & {
   options(config: AxiosRequestConfig): ChainRequester<T>
 }

let batchStack: any[] | null
let batchPromise: any

export function createChainReq<C extends Record<string, any>>(instance: AxiosInstance, controllers: C, options?: { batch?: boolean;route?: string }): ChainRequester<C> {
  const rc: any = {
    options(config: AxiosRequestConfig) {
      this._options = config
      return this
    },
  }
  let $r: ReturnType<typeof createReq>
  let $pr: ReturnType<typeof createParallelReq>
  if (options?.batch)
    $pr = createParallelReq(instance, options.route)
  else
    $r = createReq(instance)

  for (const key in controllers) {
    const proxy = new Proxy(useC(controllers[key]), {
      get(target: any, p) {
        const generator = target[p]
        if (typeof generator !== 'function')
          throw new Error(`'${p as string}' on controller must be a function !`)
        return async (...args: any) => {
          const params = generator(...args)

          if (!options?.batch) {
            const { data } = await $r(params, rc._options)
            return data
          }
          else {
            let index: number
            if (!batchStack) {
              index = 0
              batchStack = [params]
              // eslint-disable-next-line no-async-promise-executor
              batchPromise = new Promise(async (resolve) => {
                await Promise.resolve()
                const { data } = await $pr(batchStack!)
                batchStack = []
                resolve(data)
              })
            }
            else {
              index = batchStack.push(params) - 1
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
    rc[key] = proxy
  }
  return rc
}
