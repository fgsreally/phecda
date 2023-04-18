import { Phistroy } from './history'
import { ForbiddenException } from './exception'

import type { Pmeta } from './meta'
import type { Ppipe } from './pipe'
import { defaultPipe } from './pipe'

export class Pcontext {
  method: string
  params: string[]
  static metaRecord: Record<string, ReturnType<typeof parseMeta>>
  static pipe: Ppipe = defaultPipe
  static guardsRecord: Record<string, (...params: any) => boolean> = {}
  static middlewareRecord: Record<string, (...params: any) => boolean> = {}
  static interceptorsRecord: Record<string, (...params: any) => any > = {}
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

  async useGuard(guards: string[]) {
    for (const guard of guards) {
      if (this.history.record(guard, 'guard')) {
        if (!await Pcontext.guardsRecord[guard]?.(this.request))
          throw new ForbiddenException(`Guard exception--${guard}`)
      }
    }
  }

  async useInterceptor(interceptors: string[]) {
    const ret = []
    for (const interceptor of interceptors) {
      if (this.history.record(interceptor, 'interceptor')) {
        const post = await Pcontext.interceptorsRecord[interceptor]?.(this.request)
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
    return Pcontext.pipe.transform(args, reflect)
  }
}

export function addGuard(key: string, handler: (...params: any) => boolean) {
  Pcontext.registerGuard(key, handler)
}

export function addInterceptor(key: string, handler: (...params: any) => any | ((...params: any) => any)) {
  Pcontext.registerInterceptor(key, handler)
}

export function usePipe(pipe: Ppipe) {
  Pcontext.pipe = pipe
}

export function parseMeta(meta: Pmeta) {
  const { data: { params, guards, interceptors }, reflect } = meta
  return {
    guards,
    reflect,
    interceptors,
    params: params.map((param) => {
      const { type, key, validate } = param
      return { type, key, validate }
    }),
  }
}
