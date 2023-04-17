import { ForbiddenException } from './exception'
import { HttpException } from './exception/base'
import { UndefinedException } from './exception/undefine'
import type { Pmeta } from './meta'
import type { Ppipe } from './pipe'
import { defaultPipe } from './pipe'

export class Pserver {
  method: string
  params: string[]
  static pipe: Ppipe = defaultPipe
  static guardsRecord: Record<string, (...params: any) => boolean> = {}
  static middlewareRecord: Record<string, (...params: any) => boolean> = {}
  static interceptorsRecord: Record<string, (...params: any) => any | ((...params: any) => any)> = {}
  static serverRecord: Record<string, Pserver> = {}

  constructor(public key: string, public meta: Pmeta) {
    Pserver.serverRecord[key] = this
  }

  static registerGuard(key: string, handler: any) {
    Pserver.guardsRecord[key] = handler
  }

  static registerInterceptor(key: string, handler: any) {
    Pserver.interceptorsRecord[key] = handler
  }

  async useGuard(req: any, guards: string[]) {
    for (const guard of guards) {
      if (!await Pserver.guardsRecord[guard]?.(req))
        throw new ForbiddenException(`Guard exception--${guard}`)
    }
  }

  async useInterceptor(req: any, interceptors: string[]) {
    const ret = []
    for (const interceptor of interceptors) {
      const post = await Pserver.interceptorsRecord[interceptor]?.(req)
      if (post)
        ret.push(post)
    }
    return ret
  }

  async usePost(ret: any, cbs: ((...params: any[]) => any)[]) {
    for (const cb of cbs)
      ret = (await cb(ret)) | ret

    return ret
  }

  async usePipe(args: { arg: any; validate?: boolean }[], reflect: any[]) {
    return Pserver.pipe.transform(args, reflect)
  }

  methodToHandler(method: (...params: any[]) => any) {
    const { data: { params, guards, interceptors }, reflect } = this.meta

    return async (req: any) => {
      try {
        await this.useGuard(req, guards)
        const posts = await this.useInterceptor(req, interceptors!)
        const args = params.map((param) => {
          const { type, key, validate } = param
          return { arg: req[type]?.[key], validate }
        })

        const ret = await method(...await this.usePipe(args, reflect))
        return this.usePost(ret, posts)
      }
      catch (e: any) {
        console.log(e)
        if (!(e instanceof HttpException))
          return new UndefinedException(e.message || e)
        return e
      }
    }
  }
}

export function addGuard(key: string, handler: (...params: any) => boolean) {
  Pserver.registerGuard(key, handler)
}

export function addInterceptor(key: string, handler: (...params: any) => any | ((...params: any) => any)) {
  Pserver.registerInterceptor(key, handler)
}

export function usePipe(pipe: Ppipe) {
  Pserver.pipe = pipe
}
