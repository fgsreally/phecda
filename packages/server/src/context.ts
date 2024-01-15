import pc from 'picocolors'
import { defaultPipe } from './pipe'
import { ForbiddenException, FrameworkException } from './exception'
import { defaultFilter } from './filter'
import { Histroy } from './history'
import type { P } from './types'
import { IS_DEV, IS_STRICT } from './common'
import type { Meta } from './meta'
import { log } from './utils'
export const guardRecord = {} as Record<string, P.Guard>

export class Context<Data = any> {
  method: string
  params: string[]
  history = new Histroy()

  static filterRecord: Record<string, P.Filter> = {
    default: defaultFilter,
  }

  static pipeRecord: Record<string, P.Pipe> = {
    default: defaultPipe,
  }

  static guardRecord: Record<string, P.Guard> = {}
  static interceptorRecord: Record<string, P.Interceptor> = {}

  static pluginRecord: Record<string, any> = {}
  postInterceptors: Function[]

  constructor(public tag: string, public data: Data) {
    if (IS_DEV)
      // @ts-expect-error work for debug
      data._context = this
  }

  usePipe(args: { arg: any; pipe?: string; pipeOpts?: any; type: string; key: string; index: number; reflect: any }[]) {
    return Promise.all(args.map((item) => {
      if (item.pipe && !Context.pipeRecord[item.pipe]) {
        if (IS_STRICT)
          throw new FrameworkException(`can't find pipe named '${item.pipe}'`)

        else
          return Context.pipeRecord.default(item, this.tag, this.data)
      }

      return Context.pipeRecord[item.pipe || 'default'](item, this.tag, this.data)
    }))
  }

  useFilter(arg: any, filter = 'default') {
    if (!Context.filterRecord[filter]) {
      if (IS_STRICT)
        throw new FrameworkException(`can't find filter named '${filter}'`)
      else
        return Context.filterRecord.default(arg, this.tag, this.data)
    }

    return Context.filterRecord[filter](arg, this.tag, this.data)
  }

  async useGuard(guards: string[]) {
    for (const guard of guards) {
      if (this.history.record(guard, 'guard')) {
        if (!(guard in Context.guardRecord)) {
          if (IS_STRICT)
            throw new FrameworkException(`can't find guard named '${guard}'`)
          continue
        }
        if (!await Context.guardRecord[guard](this.tag, this.data))
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
        if (!(interceptor in Context.interceptorRecord)) {
          if (IS_STRICT)
            throw new FrameworkException(`can't find interceptor named '${interceptor}'`)

          continue
        }
        const postInterceptor = await Context.interceptorRecord[interceptor](this.tag, this.data)
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
        if (IS_STRICT)
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

export function addFilter(key: string, handler: P.Filter) {
  Context.filterRecord[key] = handler
}

export function addGuard(key: string, handler: P.Guard) {
  Context.guardRecord[key] = handler
}

export function addInterceptor(key: string, handler: P.Interceptor) {
  Context.interceptorRecord[key] = handler
}

export function isAopDepInject(meta: Meta[], { guards, interceptors, plugins }: {
  guards?: string[]
  interceptors?: string[]
  plugins?: string[]
} = {}) {
  const pluginSet = new Set<string>(plugins)

  const guardSet = new Set<string>(guards)
  const interceptorSet = new Set<string>(interceptors)
  const pipeSet = new Set<string>()
  meta.forEach(({ data }) => {
    data.interceptors.forEach(i => interceptorSet.add(i))
    data.guards.forEach(i => guardSet.add(i))
    data.plugins.forEach(i => pluginSet.add(i))
    data.params.forEach((i) => {
      if (i.pipe)
        pipeSet.add(i.pipe)
    })
  });

  [...pluginSet].forEach((i) => {
    if (!Context.pluginRecord[i])
      log(`${pc.white(`Plugin [${i}]`)} doesn't exist`, 'warn')
  });
  [...guardSet].forEach((i) => {
    if (!Context.guardRecord[i])
      log(`${pc.red(`Guard [${i}]`)} doesn't exist`, 'warn')
  });
  [...interceptorSet].forEach((i) => {
    if (!Context.interceptorRecord[i])
      log(`${pc.cyan(`Interceptor [${i}]`)} doesn't exist`, 'warn')
  });
  [...pipeSet].forEach((i) => {
    if (!Context.pipeRecord[i])
      log(`${pc.blue(`Pipe [${i}]`)} doesn't exist`, 'warn')
  })
}
