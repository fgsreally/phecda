import { getSymbol } from 'phecda-core'
import { Context, addInterceptor } from '../context'
import { Dev } from './dev'
import { P } from '../types'

export abstract class PInterceptor<C extends P.BaseContext = any> extends Dev {
  abstract use( ctx: C): Function | Promise<Function> | any
  readonly key: string

  constructor(tag?: string) {
    super()

    this.key = tag || getSymbol(this)

    this.onUnmount(() => {
      delete Context.interceptorRecord[this.key]
    })
    addInterceptor(this.key, this.use.bind(this))
  }
}
