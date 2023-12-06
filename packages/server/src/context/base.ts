import { ForbiddenException, FrameworkException } from '../exception'
import { Histroy } from '../history'

import type { Meta } from '../meta'
import type { P } from '../types'
import { warn } from '../utils'

export abstract class Context<Data = any> {
  method: string
  params: string[]

  static metaRecord: Record<string, Meta> = {}
  static metaDataRecord: Record<string, ReturnType<typeof parseMeta>> = {}
  static guardsRecord: Record<string, any> = {}
  static interceptorsRecord: Record<string, any > = {}
  // static serverRecord: Record<string, Context> = {}
  post: ((...params: any) => any)[]
  history = new Histroy()

  constructor(public key: string, public data: Data) {
  }

  static registerGuard(key: string, handler: any) {
    Context.guardsRecord[key] = handler
  }

  static registerInterceptor(key: string, handler: any) {
    Context.interceptorsRecord[key] = handler
  }

  async useGuard(guards: string[], isMerge = false) {
    for (const guard of guards) {
      if (this.history.record(guard, 'guard')) {
        if (!(guard in Context.guardsRecord)) {
          if (process.env.PS_STRICT)
            throw new FrameworkException(`can't find guard named '${guard}'`)
          continue
        }
        if (!await Context.guardsRecord[guard](this.data, isMerge))
          throw new ForbiddenException(`Guard exception--${guard}`)
      }
    }
  }

  async useInterceptor(interceptors: string[], isMerge = false) {
    const ret = []
    for (const interceptor of interceptors) {
      if (this.history.record(interceptor, 'interceptor')) {
        if (!(interceptor in Context.interceptorsRecord)) {
          if (process.env.PS_STRICT)
            throw new FrameworkException(`can't find interceptor named '${interceptor}'`)

          continue
        }
        const post = await Context.interceptorsRecord[interceptor](this.data, isMerge)
        if (post) {
          if (typeof post === 'function')
            ret.push(post)

          else
            return ret
        }
      }
    }
    this.post = ret
  }

  async usePost(data: any) {
    if (!this.post)
      return data
    for (const cb of this.post)
      data = (await cb(data)) || data

    return data
  }
}

export function addGuard(key: string, handler: P.Guard) {
  Context.registerGuard(key, handler)
}

export function addInterceptor(key: string, handler: P.Interceptor) {
  Context.registerInterceptor(key, handler)
}

export function parseMeta(meta: Meta) {
  const { data: { params, guards, interceptors, middlewares }, reflect, handlers } = meta

  params.forEach(({ index, key }, i) => {
    if (index !== i)
      warn(`the ${i + 1}th argument on the method '${key}' require decorator`)
  })
  return {
    guards,
    reflect,
    interceptors,
    middlewares,
    handlers,
    params,
  }
}
