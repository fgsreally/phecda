import type { ExpressCtx } from '../context'
import { addInterceptor } from '../context'

export abstract class ExpressInterceptor {
  abstract use(tag: string, ctx: ExpressCtx): ((arg: any) => any) | void

  constructor(tag: string) {
    addInterceptor(tag, this.use.bind(this))
  }
}
