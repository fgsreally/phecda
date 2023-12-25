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
  static pipeRecord: Record<string, P.Pipe> = {
    default: defaultPipe,
  }

  static guardsRecord: Record<string, P.Guard> = {}
  static interceptorsRecord: Record<string, P.Interceptor> = {}

  static pluginRecord: Record<string, any> = {}
  postInterceptors: Function[]

  constructor(public tag: string, public data: Data) {
    if (process.env.NODE_ENV === 'development')
      // @ts-expect-error work for debug
      data._context = this
  }

  usePipe(args: { arg: any; pipe?: string; pipeOpts?: any; type: string; key: string; index: number; reflect: any }[]) {
    return Promise.all(args.map((item) => {
      return Context.pipeRecord[item.pipe || 'default'](item, this.tag, this.data)
    }))
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
            return postInterceptor
        }
      }
    }
    this.postInterceptors = ret
  }

  static usePlugin(plugins: string[]) {
    const ret = []
    for (const m of plugins) {
      if (!(m in Context.pluginRecord)) {
        if (process.env.PS_STRICT)
          throw new FrameworkException(`can't find middleware named '${m}'`)

        continue
      }
      ret.push(Context.pluginRecord[m])
    }
    return ret as any[]
  }
}
export function addPlugin<C>(key: string, handler: C) {
  Context.pluginRecord[key] = handler
}

export function addPipe(key: string, pipe: P.Pipe) {
  Context.pipeRecord[key] = pipe
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
