import type { RequestHandler } from 'express'
import { ForbiddenException, FrameworkException } from '../exception'
import { defaultPipe } from '../pipe'
import { defaultFilter } from '../filter'
import type { P, ServerCtx } from '../types'
import type { Meta } from '../meta'
import { warn } from '../utils'
import { BaseContext } from './base'

export class Context extends BaseContext<ServerCtx> {
  static pipe = defaultPipe
  static filter = defaultFilter

  static metaRecord: Record<string, Meta> = {}
  static metaDataRecord: Record<string, ReturnType<typeof parseMeta>> = {}

  static middlewareRecord: Record<string, (...params: any) => any> = {}
  static guardsRecord: Record<string, any> = {}
  static interceptorsRecord: Record<string, any > = {}

  postInterceptors: Function[]

  static useMiddleware(middlewares: string[]) {
    const ret = []
    for (const m of middlewares) {
      if (!(m in Context.middlewareRecord)) {
        if (process.env.PS_STRICT)
          throw new FrameworkException(`can't find middleware named '${m}'`)

        continue
      }
      ret.push(Context.middlewareRecord[m])
    }
    return ret
  }

  usePipe(args: { arg: any; option?: any; type: string; key: string; index: number; reflect: any }[], tag: string) {
    return Context.pipe(args, tag, this.data)
  }

  useFilter(arg: any) {
    return Context.filter(arg, this.data)
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

  async usePostInterceptor(ret: any) {
    for (const cb of this.postInterceptors)
      ret = await cb(ret) || ret

    return ret
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
        const postInterceptor = await Context.interceptorsRecord[interceptor](this.data, isMerge)
        if (postInterceptor !== undefined) {
          if (typeof postInterceptor === 'function')
            ret.push(postInterceptor)

          else
            return true
        }
      }
    }
    this.postInterceptors = ret
  }
}

export function addMiddleware(key: string, handler: RequestHandler) {
  Context.middlewareRecord[key] = handler
}

export function setPipe(pipe: P.Pipe) {
  Context.pipe = pipe
}

export function setFilter(filter: P.Filter) {
  Context.filter = filter
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
