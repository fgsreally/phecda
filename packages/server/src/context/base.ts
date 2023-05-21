import { ForbiddenException, FrameworkException } from '../exception'
import { Phistroy } from '../history'

import type { Pmeta } from '../meta'
import type { Pguard, Pinterceptor } from '../types'

export abstract class Pcontext<Data = any> {
  method: string
  params: string[]

  static metaRecord: Record<string, Pmeta> = {}
  static metaDataRecord: Record<string, ReturnType<typeof parseMeta>> = {}
  static instanceRecord: Record<string, any> = {}
  static guardsRecord: Record<string, (req: any, isMerge: boolean) => boolean> = {}
  static interceptorsRecord: Record<string, (req: any, isMerge: boolean) => any > = {}
  // static serverRecord: Record<string, Pcontext> = {}
  post: ((...params: any) => any)[]
  history = new Phistroy()

  constructor(public key: string, public data: Data) {
  }

  static registerGuard(key: string, handler: any) {
    Pcontext.guardsRecord[key] = handler
  }

  static registerInterceptor(key: string, handler: any) {
    Pcontext.interceptorsRecord[key] = handler
  }

  async useGuard(guards: string[], isMerge = false) {
    for (const guard of guards) {
      if (this.history.record(guard, 'guard')) {
        if (!(guard in Pcontext.guardsRecord))
          throw new FrameworkException(`can't find guard named ${guard}`)
        if (!await Pcontext.guardsRecord[guard](this.data, isMerge))
          throw new ForbiddenException(`Guard exception--${guard}`)
      }
    }
  }

  async useInterceptor(interceptors: string[], isMerge = false) {
    const ret = []
    for (const interceptor of interceptors) {
      if (this.history.record(interceptor, 'interceptor')) {
        if (!(interceptor in Pcontext.interceptorsRecord))
          throw new FrameworkException(`can't find guard named ${interceptor}`)
        const post = await Pcontext.interceptorsRecord[interceptor](this.data, isMerge)
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

export function addGuard(key: string, handler: Pguard) {
  Pcontext.registerGuard(key, handler)
}

export function addInterceptor(key: string, handler: Pinterceptor) {
  Pcontext.registerInterceptor(key, handler)
}
export function getInstance(tag: string) {
  return Pcontext.instanceRecord[tag]
}

export function parseMeta(meta: Pmeta) {
  const { data: { params, guards, interceptors, middlewares }, reflect } = meta
  return {
    guards,
    reflect,
    interceptors,
    middlewares,
    params: params.map((param) => {
      const { type, key, validate } = param
      return { type, key, validate }
    }),
  }
}
