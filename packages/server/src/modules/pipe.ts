import { getTag } from 'phecda-core'
import { Context, addPipe } from '../context'
import type { BaseCtx } from '../types'
import { ServerBase } from './base'
export abstract class PPipe<Ctx extends BaseCtx = any> extends ServerBase {
  readonly key: PropertyKey

  constructor(tag?: string) {
    super()

    this.key = tag || getTag(this)
    addPipe(this.key, this.use.bind(this))
    this.onUnmount(() => {
      delete Context.pipeRecord[this.key]
    })
  }

  abstract use(param: { arg: any; option?: any; key: string; type: string; index: number; reflect: any }, ctx: Ctx): any
}
