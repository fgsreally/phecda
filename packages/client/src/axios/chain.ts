import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { P } from 'phecda-server'
import type { RequestArgs } from './base'
import { toReq } from './base'

type ToAxios<R> = {
  [K in keyof R]: R[K] extends (...args: any) => any ? (...p: Parameters<R[K]>) => Promise<P.Res<Awaited<ReturnType<R[K]>>> > : R[K]
}

export type ChainController<T extends Record<string, any>> = {
  [K in keyof T]: ToAxios<T[K]>;
} & {
  options(config: AxiosRequestConfig): ChainController<T>
}

let batchStack: any[]
let batchInvoker: any

export function createChainRequest<C extends Record<string, any>>(instance: AxiosInstance, controllers: C, options?: { batch?: boolean }): ChainController<C> {
  const rc: any = {
    options(config: AxiosRequestConfig) {
      this._options = config
      return this
    },
  }
  for (const key in controllers) {
    const proxy = new Proxy(controllers[key], {
      get(target, p) {
        const generator = target[p]
        if (typeof generator !== 'function')
          throw new Error(`'${p as string}' on controller must be a function !`)
        return (...args: any) => {
          const { url, params, query, body, method } = toReq(generator(...args) as RequestArgs)

          const ret = [`${url}${params}${query}`] as any[]
          body && ret.push(body)
          rc._options && ret.push(rc._options)
          if (!options?.batch) { // @ts-expect-error misdirction
            const { data } = instance[method](...ret)
            return data
          }
          else {
            if (!batchStack) {
              batchStack = [ret]
              batchInvoker = Promise.resolve()
            }
            else { batchStack.push(ret) }
          }
        }
      },
    })
    rc[key] = proxy
  }
  return rc
}
