import { HttpException } from './exception/base'
import { UndefinedException } from './exception/undefine'
import type { ServerMeta } from './types'

export class PhecdaServer {
  method: string
  params: string[]
  static guardsRecord: Record<string, (...params: any) => boolean> = {}
  static interceptorsRecord: Record<string, (...params: any) => any | void> = {}
  static serverRecord: Record<string, PhecdaServer> = {}

  constructor(public key: string, public meta: ServerMeta) {
    PhecdaServer.serverRecord[key] = this
  }

  static registerGuard(key: string, handler: any) {
    PhecdaServer.guardsRecord[key] = handler
  }

  static registerInterceptor(key: string, handler: any) {
    PhecdaServer.interceptorsRecord[key] = handler
  }

  // static print() {
  //   return Object.values(PhecdaServer.serverRecord).map((item) => {
  //     return {
  //       key: item.key,
  //       params: item.params,
  //       method: item.method,
  //     }
  //   })
  // }

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

  requestToMethod(method: (...params: any[]) => any) {
    const params: ServerMeta['params'] = this.meta.params || []

    const guards = this.meta.guards || []
    const interceptors = this.meta.interceptor || []

    this.params = params.map((param) => {
      return `${param.type}-${param.key}`
    })
    return async (req: any) => {
      try {
        await this.useGuard(req, guards)
        const posts = await this.useInterceptor(req, interceptors!)
        const ret = await method(...params.map(param => req[param.type][param.key]))
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
