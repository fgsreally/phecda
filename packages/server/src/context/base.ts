import { ForbiddenException, FrameworkException } from '../exception'
import { Histroy } from '../history'
import type { P } from '../types'

export abstract class BaseContext<Data = any> {
  method: string
  params: string[]
  history = new Histroy()
  abstract singletonConf: {
    filter: P.Filter
    pipe: P.Pipe
  }

  abstract guardsRecord: Record<string, P.Guard>
  abstract interceptorsRecord: Record<string, P.Interceptor>
  postInterceptors: Function[]

  constructor(public tag: string, public data: Data) {
  }

  usePipe(args: { arg: any; option?: any; type: string; key: string; index: number; reflect: any }[]) {
    return this.singletonConf.pipe(args, this.tag, this.data)
  }

  useFilter(arg: any) {
    return this.singletonConf.filter(arg, this.tag, this.data)
  }

  async useGuard(guards: string[]) {
    for (const guard of guards) {
      if (this.history.record(guard, 'guard')) {
        if (!(guard in this.guardsRecord)) {
          if (process.env.PS_STRICT)
            throw new FrameworkException(`can't find guard named '${guard}'`)
          continue
        }
        if (!await this.guardsRecord[guard](this.tag, this.data))
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
        if (!(interceptor in this.interceptorsRecord)) {
          if (process.env.PS_STRICT)
            throw new FrameworkException(`can't find interceptor named '${interceptor}'`)

          continue
        }
        const postInterceptor = await this.interceptorsRecord[interceptor](this.tag, this.data)
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
