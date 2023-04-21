import { WrongMetaException } from './exception/wrong-meta'
import { Phistroy } from './history'
import { ForbiddenException } from './exception'

import type { Pmeta } from './meta'
import type { Ppipe } from './pipe'
import { defaultPipe } from './pipe'

export class Pcontext {
  method: string
  params: string[]
  static pipe: Ppipe = defaultPipe
  static metaRecord: Record<string, ReturnType<typeof parseMeta>> = {}
  static guardsRecord: Record<string, (req: any, isMerge: boolean) => boolean> = {}
  static middlewareRecord: Record<string, (...params: any) => boolean> = {}
  static interceptorsRecord: Record<string, (req: any, isMerge: boolean) => any > = {}
  // static serverRecord: Record<string, Pcontext> = {}
  post: ((...params: any) => any)[]
  history = new Phistroy()
  constructor(public key: string, public request: any) {
  }

  static registerGuard(key: string, handler: any) {
    Pcontext.guardsRecord[key] = handler
  }

  static registerInterceptor(key: string, handler: any) {
    Pcontext.interceptorsRecord[key] = handler
  }

  static useMiddleware(middlewares: string[]) {
    return middlewares.map((m) => {
      if (!(m in Pcontext.middlewareRecord))
        throw new WrongMetaException(`can't find middleware named ${m}`)
      return Pcontext.middlewareRecord[m]
    })
  }

  async useGuard(guards: string[], isMerge = false) {
    for (const guard of guards) {
      if (this.history.record(guard, 'guard')) {
        if (!(guard in Pcontext.guardsRecord))
          throw new WrongMetaException(`can't find guard named ${guard}`)
        if (!await Pcontext.guardsRecord[guard](this.request, isMerge))
          throw new ForbiddenException(`Guard exception--${guard}`)
      }
    }
  }

  async useInterceptor(interceptors: string[], isMerge = false) {
    const ret = []
    for (const interceptor of interceptors) {
      if (this.history.record(interceptor, 'interceptor')) {
        if (!(interceptor in Pcontext.interceptorsRecord))
          throw new WrongMetaException(`can't find guard named ${interceptor}`)
        const post = await Pcontext.interceptorsRecord[interceptor](this.request, isMerge)
        if (post)
          ret.push(post)
      }
    }
    this.post = ret
  }

  async usePost(data: any) {
    for (const cb of this.post)
      data = (await cb(data)) | data

    return data
  }

  async usePipe(args: { arg: any; validate?: boolean }[], reflect: any[]) {
    return Pcontext.pipe.transform?.(args, reflect)
  }
}

export function addGuard(key: string, handler: (req: any, isMerge: boolean) => boolean) {
  Pcontext.registerGuard(key, handler)
}

export function addInterceptor(key: string, handler: (req: any, isMerge: boolean) => any) {
  Pcontext.registerInterceptor(key, handler)
}

export function usePipe(pipe: Ppipe) {
  Pcontext.pipe = pipe
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
