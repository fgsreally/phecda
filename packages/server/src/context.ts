import Debug from 'debug'
import pc from 'picocolors'
import { defaultPipe } from './pipe'
import { defaultFilter } from './filter'
import type { BaseContext, DefaultOptions } from './types'
import { IS_HMR } from './common'
import type { Exception } from './exception'
import { resolveDep } from './helper'
import { ControllerMeta } from './meta'

const debug = Debug('phecda-server(Context)')

export interface AOP {
  guards: GuardType[]
  pipe: PipeType[]
  filter: FilterType
}

export interface PipeArg { arg: any; pipe?: string; key: string; type: string; index: number; reflect: any; define: Record<string, any> }
export type GuardType<C extends BaseContext = any> = (ctx: C, next: () => Promise<any>) => any
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

  static guardRecord: Record<PropertyKey, {
    value: GuardType
    priority: number
  }> = {}

  static addonRecord: Record<PropertyKey, {
    value: (router: any, framework: string) => any
    priority: number

  }> = {}

  constructor(public data: Data) {
    if (IS_HMR)
      // @ts-expect-error work for debug
      data._context = this
  }

  static getAop(meta: ControllerMeta, opts: DefaultOptions) {
    const { globalGuards = [], globalFilter = 'default', globalPipe = 'default' } = opts
    const {
      data: {
        guards, filter,
        params, tag, func,
      },
    } = meta

    const resolved = {
      guards: [...globalGuards, ...guards],
      pipe: params.map(item => item.pipe || globalPipe),
      filter: filter || globalFilter,

    }

    if (process.env.DEBUG) {
      const { guards, pipe, filter } = resolved
      debug(`func "${tag}-${func}" aop: \n${pc.magenta(`Guard ${guards.join('->')}[${guards.filter(g => g in this.guardRecord).join('->')}]`)}\n${pc.blue(`Pipe ${pipe.join('-')}[${pipe.map(p => p in this.pipeRecord ? p : 'default').join('-')}]`)}\n${pc.red(`Filter ${filter}[${filter || 'default'}]`)}`)
    }
    return {
      guards: this.getGuards(resolved.guards),
      pipe: this.getPipe(resolved.pipe),
      filter: this.getFilter(resolved.filter),
    }
  }

  public async run<ResponseData = any, ReturnErr = any>({
    guards, filter, pipe,
  }: {
    guards: GuardType[]
    filter: FilterType
    pipe: PipeType[]
  }, successCb: (data: any) => ResponseData, failCb: (err: any) => ReturnErr) {
    const { meta, moduleMap } = this.data
    const {
      paramsType,
      data: {
        ctxs,
        tag,
        params,
        func,
      },
    } = meta

    try {
      // let current = 0
      let res: any
      const nextHandler = (index: number) => {
        return async () => {
          if (index === guards.length) {
            const instance = moduleMap.get(tag)!
            if (ctxs) {
              ctxs.forEach(ctx => instance[ctx] = this.data,
              )
            }
            const args = await Promise.all(
              params.map((item, i) =>
                pipe[i]({ arg: resolveDep(this.data[item.type], item.key), reflect: paramsType[item.index], ...item }, this.data),
              ),
            )
            res = await instance[func](...args)
          }
          else {
            let nextPromise: Promise<any> | undefined
            async function next() {
              return nextPromise = nextHandler(index + 1)().then((ret) => {
                if (ret !== undefined) {
                  debug(`The ${index + 1}th guard on "${tag}-${func}" rewrite the response value.`)
                  res = ret
                }

                return res
              })
            }

            const ret = await guards[index](this.data, next)

            if (ret !== undefined) {
              res = ret
            }
            else {
              if (!nextPromise)
                await next()

              else
                await nextPromise
            }
          }
        }
      }
      await nextHandler(0)()

      return successCb(res)
    }
    catch (e) {
      const err = await filter(e, this.data)
      return failCb(err)
    }
  }

  static getPipe(pipe: string[]) {
    return pipe.map((pipe) => {
      return Context.pipeRecord[pipe] || Context.pipeRecord.default
    })
  }

  static getFilter(filter = 'default') {
    return Context.filterRecord[filter] || Context.filterRecord.default
  }

  static getGuards(guards: string[]) {
    const ret: { value: GuardType; priority: number }[] = []
    for (const guard of new Set(guards)) {
      if (guard in Context.guardRecord)
        ret.push(Context.guardRecord[guard])
    }

    return ret.sort((a, b) => b.priority - a.priority).map(item => item.value)
  }

  static applyAddons(addons: string[], router: any, framework: string) {
    const ret: {
      value: (router: any, framework: string) => any
      priority: number
    }[] = []
    for (const a of new Set(addons)) {
      if (a in Context.addonRecord)
        ret.push(Context.addonRecord[a])
    }

    ret.sort((a, b) => b.priority - a.priority).forEach(item => item.value(router, framework))

    // await Context.addonRecord[a](router, framework)
  }
}

export function addPipe<C extends BaseContext>(key: PropertyKey, pipe: PipeType<C>) {
  if (Context.pipeRecord[key] && Context.pipeRecord[key] !== pipe)
    debug(`overwrite Pipe "${String(key)}"`, 'warn')
  Context.pipeRecord[key] = pipe
}

export function addFilter<C extends BaseContext>(key: PropertyKey, filter: FilterType<C>) {
  if (Context.filterRecord[key] && Context.filterRecord[key] !== filter)
    debug(`overwrite Filter "${String(key)}"`, 'warn')
  Context.filterRecord[key] = filter
}

export function addGuard<C extends BaseContext>(key: PropertyKey, guard: GuardType<C>, priority = 0) {
  if (Context.guardRecord[key] && Context.guardRecord[key].value !== guard)
    debug(`overwrite Guard "${String(key)}"`, 'warn')

  Context.guardRecord[key] = {
    value: guard,
    priority,
  }
}
export function addAddon(key: PropertyKey, addon: (router: any, framework: string) => void, priority = 0) {
  if (Context.addonRecord[key] && Context.addonRecord[key].value !== addon)
    debug(`overwrite Addon "${String(key)}"`, 'warn')
  Context.addonRecord[key] = {
    value: addon,
    priority,
  }
}
