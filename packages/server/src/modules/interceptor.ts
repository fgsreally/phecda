import { getTag } from 'phecda-core'
import { Context, addInterceptor } from '../context'
import type { BaseContext } from '../types'
import { ServerBase } from './base'

export abstract class PInterceptor<C extends BaseContext = any> extends ServerBase {
  abstract use(ctx: C): Function | Promise<Function> | any
  readonly key: PropertyKey

  constructor(tag?: string) {
    super()

    this.key = tag || getTag(this)

    this.onUnmount(() => {
      delete Context.interceptorRecord[this.key]
    })
    addInterceptor(this.key, this.use.bind(this))
  }
}
