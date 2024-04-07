import pc from 'picocolors'
import { defaultPipe } from './pipe'
import { ForbiddenException, FrameworkException } from './exception'
import { defaultFilter } from './filter'
import { Histroy } from './history'
import type { P } from './types'
import { IS_DEV, IS_STRICT } from './common'
import type { Meta } from './meta'
import { log } from './utils'
import type { Exception } from './exception'

export type GuardType<C extends P.BaseContext = any> = ((ctx: C) => Promise<boolean> | boolean)
export type InterceptorType<C extends P.BaseContext = any> = (ctx: C) => (any | ((ret: any) => any))
export type PipeType<C extends P.BaseContext = any> = (arg: { arg: any; option?: any; key: string; type: string; index: number; reflect: any }, ctx: C) => Promise<any>
export type FilterType<C extends P.BaseContext = any, E extends Exception = any> = (err: E | Error, ctx?: C) => Error | any

export class Context<Data extends P.BaseContext> {
  method: string
  params: string[]
  history = new Histroy()

  static filterRecord: Record<PropertyKey, FilterType> = {
    default: defaultFilter,
  }

  static pipeRecord: Record<PropertyKey, PipeType> = {
    default: defaultPipe,
  }

  static guardRecord: Record<PropertyKey, GuardType> = {}
  static interceptorRecord: Record<PropertyKey, InterceptorType> = {}

  static pluginRecord: Record<PropertyKey, any> = {}
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

export function addPlugin<T>(key: PropertyKey, handler: T) {
  if (Context.pluginRecord[key] && Context.pluginRecord[key] !== handler)
    log(`overwrite Plugin "${String(key)}"`, 'warn')

  Context.pluginRecord[key] = handler
}

export function addPipe<C extends P.BaseContext>(key: PropertyKey, handler: PipeType<C>) {
  if (Context.pipeRecord[key] && Context.pipeRecord[key] !== handler)
    log(`overwrite PipeType "${String(key)}"`, 'warn')
  Context.pipeRecord[key] = handler
}

export function addFilter<C extends P.BaseContext>(key: PropertyKey, handler: FilterType<C>) {
  if (Context.filterRecord[key] && Context.filterRecord[key] !== handler)
    log(`overwrite FilterType "${String(key)}"`, 'warn')
  Context.filterRecord[key] = handler
}

export function addGuard<C extends P.BaseContext>(key: PropertyKey, handler: GuardType<C>) {
  if (Context.guardRecord[key] && Context.guardRecord[key] !== handler)
    log(`overwrite GuardType "${String(key)}"`, 'warn')
  Context.guardRecord[key] = handler
}

export function addInterceptor<C extends P.BaseContext>(key: PropertyKey, handler: InterceptorType<C>) {
  if (Context.interceptorRecord[key] && Context.interceptorRecord[key] !== handler)
    log(`overwrite InterceptorType "${String(key)}"`, 'warn')
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

  const missPlugins = [...pluginSet].filter(i => !Context.pluginRecord[i])
  const missGuards = [...guardSet].filter(i => !Context.guardRecord[i])
  const missInterceptors = [...interceptorSet].filter(i => !Context.interceptorRecord[i])
  const missPipes = [...pipeSet].filter(i => !Context.pipeRecord[i])
  const missFilters = [...filterSet].filter(i => !Context.filterRecord[i])

  if (missPlugins.length)
    log(`${pc.white(`Plugin [${missPlugins.join(',')}]`)} doesn't exist`, 'warn')
  if (missGuards.length)
    log(`${pc.magenta(`GuardType [${missGuards.join(',')}]`)} doesn't exist`, 'warn')

  if (missInterceptors.length)
    log(`${pc.cyan(`InterceptorType [${missInterceptors.join(',')}]`)} doesn't exist`, 'warn')

  if (missPipes.length)
    log(`${pc.blue(`PipeType [${missPipes.join(',')}]`)} doesn't exist`, 'warn')

  if (missFilters.length)
    log(`${pc.red(`FilterType [${missFilters.join(',')}]`)} doesn't exist`, 'warn')
}
