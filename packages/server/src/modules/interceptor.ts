import { getSymbol } from 'phecda-core'
import { Context, addInterceptor } from '../context'
import { Dev } from './dev'

export abstract class PInterceptor<C = any> extends Dev {
  abstract use(tag: string, ctx: C): Function | Promise<Function> | any

  constructor(tag?: string) {
    super()

    const key = tag || getSymbol(this)

    this.onUnmount(() => {
      delete Context.interceptorRecord[key]
    })
    addInterceptor(key, this.use.bind(this))
  }
}
