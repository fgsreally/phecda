import pc from 'picocolors'
import Debug from 'debug'
import { defaultPipe } from './pipe'
import { ForbiddenException, FrameworkException } from './exception'
import { defaultFilter } from './filter'
import { Histroy } from './history'
import type { BaseContext } from './types'
import { IS_HMR, IS_STRICT } from './common'
import type { Meta } from './meta'
import { log } from './utils'
import type { Exception } from './exception'

const debug = Debug('phecda-server(Context)')

export type GuardType<C extends BaseContext = any> = ((ctx: C) => Promise<boolean> | boolean)
export type InterceptorType<C extends BaseContext = any> = (ctx: C) => (any | ((ret: any) => any))
export type PipeType<C extends BaseContext = any> = (arg: { arg: any; pipe?: string; key: string; type: string; index: number; reflect: any; define: Record<string, any> }, ctx: C) => Promise<any>
export type FilterType<C extends BaseContext = any, E extends Exception = any> = (err: E | Error, ctx?: C) => Error | any

export class Context<Data extends BaseContext> {
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
    if (IS_HMR)
      // @ts-expect-error work for debug
      data._context = this
  }

  usePipe(args: { arg: any; pipe?: string; define: Record<string, any>; type: string; key: string; index: number; reflect: any }[]) {
    return Promise.all(args.map((item) => {
      if (item.pipe && !Context.pipeRecord[item.pipe]) {
        if (IS_STRICT) {
          throw new FrameworkException(`can't find pipe named '${item.pipe}'`)
        }

        else {
          debug(`Can't find pipe named "${item.pipe}" when handling the ${item.index + 1}th argument of the func "${this.data.func}" on module "${this.data.tag}",use default pipe instead`)

          return Context.pipeRecord.default(item, this.data)
        }
      }

      return Context.pipeRecord[item.pipe || 'default'](item, this.data)
    }))
  }

  useFilter(arg: any, filter = 'default') {
    if (!Context.filterRecord[filter]) {
      if (IS_STRICT) {
        throw new FrameworkException(`can't find filter named "${filter}"`)
      }
      else {
        debug(`Can't find filter named "${filter}" when handling func "${this.data.func}" on module "${this.data.tag}",use default filter instead`)

        return Context.filterRecord.default(arg, this.data)
      }
    }

    return Context.filterRecord[filter](arg, this.data)
  }

  async useGuard(guards: string[]) {
    for (const guard of guards) {
      if (this.history.record(guard, 'guard')) {
        if (!(guard in Context.guardRecord)) {
          if (IS_STRICT)
            throw new FrameworkException(`Can't find guard named "${guard}"`)
          else debug(`Can't find guard named "${guard}" when handling func "${this.data.func}" on module "${this.data.tag}",skip it`)
          continue
        }
        if (!await Context.guardRecord[guard](this.data))
          throw new ForbiddenException(`Guard exception--[${guard}]`)
      }
    }
  }

  async usePostInterceptor(data: any) {
    for (const cb of this.postInterceptors) {
      const ret = await cb(data)
      if (ret !== undefined)
        return ret
    }
  }

  async useInterceptor(interceptors: string[]) {
    const cb = []
    for (const interceptor of interceptors) {
      if (this.history.record(interceptor, 'interceptor')) {
        if (!(interceptor in Context.interceptorRecord)) {
          if (IS_STRICT)
            throw new FrameworkException(`can't find interceptor named "${interceptor}"`)
          else debug(`Can't find interceptor named "${interceptor}" when handling func "${this.data.func}" on module "${this.data.tag}",skip it`)

          continue
        }
        const interceptRet = await Context.interceptorRecord[interceptor](this.data)
        if (interceptRet !== undefined) {
          if (typeof interceptRet === 'function')
            cb.push(interceptRet)

          else
            return interceptRet
        }
      }
    }
    this.postInterceptors = cb
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

export function addPipe<C extends BaseContext>(key: PropertyKey, handler: PipeType<C>) {
  if (Context.pipeRecord[key] && Context.pipeRecord[key] !== handler)
    log(`overwrite Pipe "${String(key)}"`, 'warn')
  Context.pipeRecord[key] = handler
}

export function addFilter<C extends BaseContext>(key: PropertyKey, handler: FilterType<C>) {
  if (Context.filterRecord[key] && Context.filterRecord[key] !== handler)
    log(`overwrite Filter "${String(key)}"`, 'warn')
  Context.filterRecord[key] = handler
}

export function addGuard<C extends BaseContext>(key: PropertyKey, handler: GuardType<C>) {
  if (Context.guardRecord[key] && Context.guardRecord[key] !== handler)
    log(`overwrite Guard "${String(key)}"`, 'warn')
  Context.guardRecord[key] = handler
}

export function addInterceptor<C extends BaseContext>(key: PropertyKey, handler: InterceptorType<C>) {
  if (Context.interceptorRecord[key] && Context.interceptorRecord[key] !== handler)
    log(`overwrite Interceptor "${String(key)}"`, 'warn')
  Context.interceptorRecord[key] = handler
}

// detect whether plugin/filter/pipe/guard/intercept is injected
export function detectAopDep(meta: Meta[], { guards, interceptors, plugins }: {
  guards?: string[]
  interceptors?: string[]
  plugins?: string[]
} = {}, type: 'http' | 'rpc' = 'http') {
  const pluginSet = new Set<string>(plugins)

  const guardSet = new Set<string>(guards)
  const interceptorSet = new Set<string>(interceptors)
  const pipeSet = new Set<string>()

  const filterSet = new Set<string>()

  meta.forEach(({ data }) => {
    if (!data[type])
      return

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
    log(`${pc.magenta(`Guard [${missGuards.join(',')}]`)} doesn't exist`, 'warn')

  if (missInterceptors.length)
    log(`${pc.cyan(`Interceptor [${missInterceptors.join(',')}]`)} doesn't exist`, 'warn')

  if (missPipes.length)
    log(`${pc.blue(`Pipe [${missPipes.join(',')}]`)} doesn't exist`, 'warn')

  if (missFilters.length)
    log(`${pc.red(`Filter [${missFilters.join(',')}]`)} doesn't exist`, 'warn')

  return {
    missPlugins,
    missGuards,
    missInterceptors,
    missPipes,
    missFilters,
  }
}
