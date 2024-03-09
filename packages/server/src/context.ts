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

export class Context<Data extends P.BaseContext> {
  method: string
  params: string[]
  history = new Histroy()

  static filterRecord: Record<PropertyKey, P.Filter> = {
    default: defaultFilter,
  }

  static pipeRecord: Record<PropertyKey, P.Pipe> = {
    default: defaultPipe,
  }

  static guardRecord: Record<PropertyKey, P.Guard> = {}
  static interceptorRecord: Record<PropertyKey, P.Interceptor> = {}

  static addonRecord: Record<PropertyKey, any> = {}
  postInterceptors: Function[]

  constructor(public data: Data) {
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
          return Context.pipeRecord.default(item, this.data)
      }

      return Context.pipeRecord[item.pipe || 'default'](item, this.data)
    }))
  }

  useFilter(arg: any, filter = 'default') {
    if (!Context.filterRecord[filter]) {
      if (IS_STRICT)
        throw new FrameworkException(`can't find filter named '${filter}'`)
      else
        return Context.filterRecord.default(arg, this.data)
    }

    return Context.filterRecord[filter](arg, this.data)
  }

  async useGuard(guards: string[]) {
    for (const guard of guards) {
      if (this.history.record(guard, 'guard')) {
        if (!(guard in Context.guardRecord)) {
          if (IS_STRICT)
            throw new FrameworkException(`can't find guard named '${guard}'`)
          continue
        }
        if (!await Context.guardRecord[guard](this.data))
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
        const postInterceptor = await Context.interceptorRecord[interceptor](this.data)
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
      if (!(m in Context.addonRecord)) {
        if (IS_STRICT)
          throw new FrameworkException(`can't find middleware named '${m}'`)

        continue
      }
      ret.push(Context.addonRecord[m])
    }
    return ret as any[]
  }
}
export function addAddon<T>(key: PropertyKey, handler: T) {
  if (Context.addonRecord[key] && Context.addonRecord[key] !== handler)
    log(`overwrite Addon "${String(key)}"`, 'warn')

  Context.addonRecord[key] = handler
}

export function addPipe<C extends P.BaseContext>(key: PropertyKey, handler: P.Pipe<C>) {
  if (Context.pipeRecord[key] && Context.pipeRecord[key] !== handler)
    log(`overwrite Pipe "${String(key)}"`, 'warn')
  Context.pipeRecord[key] = handler
}

export function addFilter<C extends P.BaseContext>(key: PropertyKey, handler: P.Filter<C>) {
  if (Context.filterRecord[key] && Context.filterRecord[key] !== handler)
    log(`overwrite Filter "${String(key)}"`, 'warn')
  Context.filterRecord[key] = handler
}

export function addGuard<C extends P.BaseContext>(key: PropertyKey, handler: P.Guard<C>) {
  if (Context.guardRecord[key] && Context.guardRecord[key] !== handler)
    log(`overwrite Guard "${String(key)}"`, 'warn')
  Context.guardRecord[key] = handler
}

export function addInterceptor<C extends P.BaseContext>(key: PropertyKey, handler: P.Interceptor<C>) {
  if (Context.interceptorRecord[key] && Context.interceptorRecord[key] !== handler)
    log(`overwrite Interceptor "${String(key)}"`, 'warn')
  Context.interceptorRecord[key] = handler
}

// detect whether plugin/filter/pipe/guard/intercept is injected
export function isAopDepInject(meta: Meta[], { guards, interceptors, plugins }: {
  guards?: string[]
  interceptors?: string[]
  plugins?: string[]
} = {}) {
  const pluginSet = new Set<string>(plugins)

  const guardSet = new Set<string>(guards)
  const interceptorSet = new Set<string>(interceptors)
  const pipeSet = new Set<string>()

  const filterSet = new Set<string>()
  meta.forEach(({ data }) => {
    if (data.filter)
      filterSet.add(data.filter)

    data.interceptors.forEach(i => interceptorSet.add(i))
    data.guards.forEach(i => guardSet.add(i))
    data.plugins.forEach(i => pluginSet.add(i))
    data.params.forEach((i) => {
      if (i.pipe)
        pipeSet.add(i.pipe)
    })
  })

  const missPlugins = [...pluginSet].filter(i => !Context.addonRecord[i])
  const missGuards = [...guardSet].filter(i => !Context.guardRecord[i])
  const missInterceptors = [...interceptorSet].filter(i => !Context.interceptorRecord[i])
  const missPipes = [...pipeSet].filter(i => !Context.pipeRecord[i])
  const missFilters = [...filterSet].filter(i => !Context.filterRecord[i])

  if (missPlugins.length)
    log(`${pc.white(`Plugin [${missPlugins.join(',')}]`)} doesn't exist`, 'warn')
  if (missGuards.length)
    log(`${pc.magenta(`Guard [${missGuards.join(',')}]`)} doesn't exist`, 'warn')

  if (missInterceptors.length)
    log(`${pc.cyan(`Interceptor [${missInterceptors.join(',')}]`)} doesn't exist`, 'warn')

  if (missPipes.length)
    log(`${pc.blue(`Pipe [${missPipes.join(',')}]`)} doesn't exist`, 'warn')

  if (missFilters.length)
    log(`${pc.red(`Filter [${missFilters.join(',')}]`)} doesn't exist`, 'warn')
}
