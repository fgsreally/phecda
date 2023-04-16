import { HttpException } from './exception/base'
import { UndefinedException } from './exception/undefine'
import type { Meta } from './meta'
import type { PhecdaPipe } from './pipe'
import { defaultPipe } from './pipe'

export class PhecdaServer {
  method: string
  params: string[]
  static pipe: PhecdaPipe = defaultPipe
  static guardsRecord: Record<string, (...params: any) => boolean> = {}
  static interceptorsRecord: Record<string, (...params: any) => any | ((...params: any) => any)> = {}
  static serverRecord: Record<string, PhecdaServer> = {}

  constructor(public key: string, public meta: Meta) {
    PhecdaServer.serverRecord[key] = this
  }

  static registerGuard(key: string, handler: any) {
    PhecdaServer.guardsRecord[key] = handler
  }

  static registerInterceptor(key: string, handler: any) {
    PhecdaServer.interceptorsRecord[key] = handler
  }

  async useGuard(req: any, guards: string[]) {
    for (const guard of guards) {
      if (!await PhecdaServer.guardsRecord[guard]?.(req))
        throw new Error('aa')
    }
  }

  async useInterceptor(req: any, interceptors: string[]) {
    const ret = []
    for (const interceptor of interceptors) {
      const post = await PhecdaServer.interceptorsRecord[interceptor]?.(req)
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

  async usePipe(args: { arg: any; validate: boolean }[], reflect: any[]) {
    return PhecdaServer.pipe.transform(args, reflect)
  }

  methodToHandler(method: (...params: any[]) => any) {
    const { data: { params = [], guards = [], interceptors = [] }, reflect = [] } = this.meta

    return async (req: any) => {
      try {
        await this.useGuard(req, guards)
        const posts = await this.useInterceptor(req, interceptors!)
        const args = params.map((param) => {
          return { arg: req[param.type]?.[param.key], validate: param.validate }
        })

        const ret = await method(...await this.usePipe(args, reflect))
        return this.usePost(ret, posts)
      }
      catch (e: any) {
        if (!(e instanceof HttpException))
          return new UndefinedException(e.message || e)
        return e
      }
    }
  }
}

export function addGuard(key: string, handler: (...params: any) => boolean) {
  PhecdaServer.registerGuard(key, handler)
}

export function addInterceptor(key: string, handler: (...params: any) => any | ((...params: any) => any)) {
  PhecdaServer.registerInterceptor(key, handler)
}

export function usePipe(pipe: PhecdaPipe) {
  PhecdaServer.pipe = pipe
}
