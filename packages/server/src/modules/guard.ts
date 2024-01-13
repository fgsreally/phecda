import { getSymbol } from 'phecda-core'
import { Context, addGuard } from '../context'
import { Dev } from './dev'

export abstract class PGuard<C = any> extends Dev {
  abstract use(tag: string, ctx: C): Promise<boolean> | boolean

  constructor(tag?: string) {
    super()
    const key = tag || getSymbol(this)

    addGuard(key, this.use.bind(this))

    this.onUnmount(() => {
      delete Context.guardRecord[key]
    })
  }
}
