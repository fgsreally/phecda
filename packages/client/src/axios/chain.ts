import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import type { P } from 'phecda-server'
import { createParallelReq, createReq, isError } from './base'

type ToAxios<R> = {
  [K in keyof R]: R[K] extends (...args: any) => any ? (...p: Parameters<R[K]>) => Promise<P.Res<Awaited<ReturnType<R[K]>>> > : R[K]
}

export type ChainController<T extends Record<string, any>> = {
  [K in keyof T]: ToAxios<T[K]>;
} & {
  options(config: AxiosRequestConfig): ChainController<T>
}

let batchStack: any[]
let batchPromise: any

export function createChainReq<C extends Record<string, any>>(instance: AxiosInstance, controllers: C, options?: { batch?: boolean }): ChainController<C> {
  const rc: any = {
    options(config: AxiosRequestConfig) {
      this._options = config
      return this
    },
  }
  const $r = createReq(instance)
  let $pr: ReturnType<typeof createParallelReq>
  if (options?.batch)
    $pr = createParallelReq(instance)

  for (const key in controllers) {
    const proxy = new Proxy(controllers[key], {
      get(target, p) {
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
                const { data } = await $pr(batchStack)
                batchStack = []
                resolve(data)
              })
            }
            else {
              index = batchStack.push(params) - 1
            }
            return new Promise((resolve, reject) => {
              batchPromise.then((data: any[]) => {
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
