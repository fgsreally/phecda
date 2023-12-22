import { defaultPipe } from './pipe'
import { ForbiddenException, FrameworkException } from './exception'
import { defaultFilter } from './filter'
import { Histroy } from './history'
import type { P } from './types'

export const guardsRecord = {} as Record<string, P.Guard>

export class Context<Data = any> {
  method: string
  params: string[]
  history = new Histroy()

  static filter: P.Filter = defaultFilter
  static pipe: P.Pipe = defaultPipe
  static guardsRecord: Record<string, P.Guard> = {}
  static interceptorsRecord: Record<string, P.Interceptor> = {}

  static middlewareRecord: Record<string, (...params: any) => any> = {}
  postInterceptors: Function[]

  constructor(public tag: string, public data: Data) {
    if (process.env.NODE_ENV === 'development')
    // @ts-expect-error work for debug
      data._context = this
  }

  usePipe(args: { arg: any; option?: any; type: string; key: string; index: number; reflect: any }[]) {
    return Context.pipe(args, this.tag, this.data)
  }

  useFilter(arg: any) {
    return Context.filter(arg, this.tag, this.data)
  }

  async useGuard(guards: string[]) {
    for (const guard of guards) {
      if (this.history.record(guard, 'guard')) {
        if (!(guard in Context.guardsRecord)) {
          if (process.env.PS_STRICT)
            throw new FrameworkException(`can't find guard named '${guard}'`)
          continue
        }
        if (!await Context.guardsRecord[guard](this.tag, this.data))
          throw new ForbiddenException(`Guard exception--${guard}`)
      }
    }
  }

  async usePostInterceptor(ret: any) {
    for (const cb of this.postInterceptors)
      ret = await cb(ret) || ret

    return ret
  }

  async useInterceptor(interceptors: string[]) {
    const ret = []
    for (const interceptor of interceptors) {
      if (this.history.record(interceptor, 'interceptor')) {
        if (!(interceptor in Context.interceptorsRecord)) {
          if (process.env.PS_STRICT)
            throw new FrameworkException(`can't find interceptor named '${interceptor}'`)

          continue
        }
        const postInterceptor = await Context.interceptorsRecord[interceptor](this.tag, this.data)
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
    return ret as any[]
  }
}
export function addMiddleware(key: string, handler: (...params: any) => any) {
  Context.middlewareRecord[key] = handler
}

export function setPipe(pipe: P.Pipe) {
  Context.pipe = pipe
}

export function setFilter(filter: P.Filter) {
  Context.filter = filter
}

export function addGuard(key: string, handler: P.Guard) {
  Context.guardsRecord[key] = handler
}

export function addInterceptor(key: string, handler: P.Interceptor) {
  Context.interceptorsRecord[key] = handler
}
