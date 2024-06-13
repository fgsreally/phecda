import Debug from 'debug'
import { defaultPipe } from './pipe'
import { ForbiddenException, FrameworkException } from './exception'
import { defaultFilter } from './filter'
import type { BaseContext, DefaultOptions } from './types'
import { IS_HMR, IS_STRICT } from './common'
import { log } from './utils'
import type { Exception } from './exception'
import { resolveDep } from './helper'

const debug = Debug('phecda-server(Context)')

export interface PipeArg { arg: any; pipe?: string; key: string; type: string; index: number; reflect: any; define: Record<string, any> }
export type GuardType<C extends BaseContext = any> = ((ctx: C) => Promise<boolean> | boolean)
export type InterceptorType<C extends BaseContext = any> = (ctx: C) => (any | ((ret: any) => any))
export type PipeType<C extends BaseContext = any> = (arg: PipeArg, ctx: C) => Promise<any>
export type FilterType<C extends BaseContext = any, E extends Exception = any> = (err: E | Error, ctx?: C) => Error | any

export class Context<Data extends BaseContext> {
  method: string
  params: string[]

  static filterRecord: Record<PropertyKey, FilterType> = {
    default: defaultFilter,
  }

  static pipeRecord: Record<PropertyKey, PipeType> = {
    default: defaultPipe,
  }

  static guardRecord: Record<PropertyKey, GuardType> = {}
  static interceptorRecord: Record<PropertyKey, InterceptorType> = {}

  static pluginRecord: Record<PropertyKey, (framework: string) => any> = {}
  private postInterceptors: Function[]

  constructor(public data: Data) {
    if (IS_HMR)
      // @ts-expect-error work for debug
      data._context = this
  }

  public async run<ReturnData = any, ReturnErr = any>(opts: DefaultOptions, successCb: (data: any) => ReturnData, failCb: (err: any) => ReturnErr) {
    const { meta, moduleMap } = this.data
    const { globalGuards = [], globalFilter, globalInterceptors = [], globalPipe } = opts
    const {
      paramsType,
      data: {
        guards, interceptors, params,
        tag, func, ctx, filter,

      },
    } = meta

    try {
      await this.useGuard([...globalGuards, ...guards])
      const i1 = await this.useInterceptor([...globalInterceptors, ...interceptors])
      if (i1 !== undefined)
        return successCb(i1)

      const args = await this.usePipe(params.map((param) => {
        return { arg: resolveDep(this.data[param.type], param.key), reflect: paramsType[param.index], ...param, pipe: param.pipe || globalPipe }
      }))
      const instance = moduleMap.get(tag)!
      if (ctx)
        instance[ctx] = this.data
      const returnData = await instance[func](...args)
      const i2 = await this.usePostInterceptor(returnData)
      if (i2 !== undefined)
        return successCb(i2)

      return successCb(returnData)
    }
    catch (e) {
      const err = await this.useFilter(e, filter || globalFilter)
      return failCb(err)
    }
  }

  private usePipe(args: PipeArg[]) {
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

  private useFilter(arg: any, filter = 'default') {
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

  private async useGuard(guards: string[]) {
    for (const guard of new Set(guards)) {
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

  private async usePostInterceptor(data: any) {
    for (const cb of this.postInterceptors) {
      const ret = await cb(data)
      if (ret !== undefined)
        return ret
    }
  }

  private async useInterceptor(interceptors: string[]) {
    const cb = []
    for (const interceptor of new Set(interceptors)) {
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
    this.postInterceptors = cb
  }

  static usePlugin<Plugin>(plugins: string[], framework: string) {
    const ret: Plugin[] = []
    for (const m of new Set(plugins)) {
      if (!(m in Context.pluginRecord)) {
        if (IS_STRICT)
          throw new FrameworkException(`can't find middleware named '${m}'`)

        continue
      }
      const plugin = Context.pluginRecord[m](framework)
      plugin && ret.push(plugin)
    }
    return ret
  }
}

export function addPlugin<T>(key: PropertyKey, handler: (framework: string) => T) {
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
