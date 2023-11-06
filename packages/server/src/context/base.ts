import { ForbiddenException, FrameworkException } from '../exception'
import { Phistroy } from '../history'

import type { Meta } from '../meta'
import type { P } from '../types'

export abstract class Context<Data = any> {
  method: string
  params: string[]

  static metaRecord: Record<string, Meta> = {}
  static metaDataRecord: Record<string, ReturnType<typeof parseMeta>> = {}
  static instanceRecord: Record<string, any> = {}
  static guardsRecord: Record<string, any> = {}
  static interceptorsRecord: Record<string, any > = {}
  // static serverRecord: Record<string, Context> = {}
  post: ((...params: any) => any)[]
  history = new Phistroy()

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
        if (!(guard in Context.guardsRecord))
          throw new FrameworkException(`can't find guard named ${guard}`)
        if (!await Context.guardsRecord[guard](this.data, isMerge))
          throw new ForbiddenException(`Guard exception--${guard}`)
      }
    }
  }

  async useInterceptor(interceptors: string[], isMerge = false) {
    const ret = []
    for (const interceptor of interceptors) {
      if (this.history.record(interceptor, 'interceptor')) {
        if (!(interceptor in Context.interceptorsRecord))
          throw new FrameworkException(`can't find guard named ${interceptor}`)
        const post = await Context.interceptorsRecord[interceptor](this.data, isMerge)
        if (post)
          ret.push(post)
      }
    }
    this.post = ret
  }

  async usePost(data: any) {
    if (!this.post)
      return data
    for (const cb of this.post)
      data = (await cb(data)) | data

    return data
  }
}

export function addGuard(key: string, handler: P.Guard) {
  Context.registerGuard(key, handler)
}

export function addInterceptor(key: string, handler: P.Interceptor) {
  Context.registerInterceptor(key, handler)
}
export function getInstance(tag: string) {
  return Context.instanceRecord[tag]
}

export function parseMeta(meta: Meta) {
  const { data: { params, guards, interceptors, middlewares }, reflect, handlers } = meta
  return {
    guards,
    reflect,
    interceptors,
    middlewares,
    handlers,
    params: params.map((param) => {
      const { type, key, validate } = param
      return { type, key, validate }
    }),
  }
}
