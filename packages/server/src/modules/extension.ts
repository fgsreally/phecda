/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import { getTag } from 'phecda-core'
import type { BaseContext, BaseError } from '../types'
import { Context, addFilter, addGuard, addInterceptor, addPipe, addPlugin } from '../context'
import type { Exception } from '../exception'
import { Dev } from './dev'

export interface PExtension<C extends BaseContext = any, E extends Exception = Exception> {

  intercept(ctx: C): Function | Promise<Function> | any

  guard(ctx: C): Promise<boolean> | boolean

  pipe(param: { arg: any; option?: any; key: string; type: string; index: number; reflect: any }, ctx: C): any

  filter(error: Error | E, ctx?: C): BaseError

  plugin(...args: any): void
}

export class PExtension extends Dev {
  readonly key: PropertyKey

  constructor(tag?: string) {
    super()

    const key = this.key = tag || getTag(this)

    if (this.pipe) {
      addPipe(key, this.pipe.bind(this))
      this.onUnmount(() => {
        delete Context.pipeRecord[key]
      })
    }

    if (this.plugin) {
      addPlugin(key, this.plugin.bind(this))

      this.onUnmount(() => {
        delete Context.pluginRecord[key]
      })
    }
    if (this.intercept) {
      addInterceptor(key, this.intercept.bind(this))

      this.onUnmount(() => {
        delete Context.interceptorRecord[key]
      })
    }
    if (this.guard) {
      addGuard(key, this.guard.bind(this))

      this.onUnmount(() => {
        delete Context.guardRecord[key]
      })
    }

    if (this.filter) {
      addFilter(key, this.filter.bind(this))
      this.onUnmount(() => {
        delete Context.filterRecord[key]
      })
    }
  }
}
