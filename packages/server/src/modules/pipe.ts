import { getSymbol } from 'phecda-core'
import { Context, addPipe } from '../context'
import type { P } from '../types'
import { Dev } from './dev'
export abstract class PPipe<C extends P.BaseContext = any> extends Dev {
  readonly key: string

  constructor(tag?: string) {
    super()

    this.key = tag || getSymbol(this)
    addPipe(this.key, this.use.bind(this))
    this.onUnmount(() => {
      delete Context.pipeRecord[this.key]
    })
  }

  abstract use(param: { arg: any; option?: any; key: string; type: string; index: number; reflect: any }, ctx: C): any
}
