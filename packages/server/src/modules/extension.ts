import { getTag } from 'phecda-core'
import type { BaseContext, BaseError } from '../types'
import { Context, addAddon, addFilter, addGuard, addPipe } from '../context'
import type { Exception } from '../exception'
import { ServerBase } from './base'

export interface PExtension<C extends BaseContext = any, E extends Exception = Exception> {

  guard(ctx: C): Promise<boolean> | boolean

  pipe(param: { arg: any; option?: any; key: string; type: string; index: number; reflect: any }, ctx: C): any

  filter(error: Error | E, ctx?: C): BaseError

  addon<Addon = any>(framework: string): Addon
}

export class PExtension extends ServerBase {
  readonly key: PropertyKey

  guardPriority: number
  addonPriority: number

  constructor(tag?: string) {
    super()

    const key = this.key = tag || getTag(this)

    if (this.pipe) {
      addPipe(key, this.pipe.bind(this))
      this.onUnmount(() => {
        // no safe enough
        delete Context.pipeRecord[key]
      })
    }

    if (this.addon) {
      addAddon(key, this.addon.bind(this), this.addonPriority)

      this.onUnmount(() => {
        delete Context.addonRecord[key]
      })
    }

    if (this.guard) {
      addGuard(key, this.guard.bind(this), this.guardPriority)

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
