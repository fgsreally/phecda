import type { FastifyCtx } from '../context'
import { addInterceptor } from '../context'

export abstract class FastifyInterceptor {
  abstract use(tag: string, ctx: FastifyCtx): ((arg: any) => any) | void

  constructor(tag: string) {
    addInterceptor(tag, this.use.bind(this))
  }
}
