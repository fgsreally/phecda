import { addInterceptor } from '../context'
import type { ServerCtx } from '../types'

export abstract class ServerInterceptor {
  abstract use(ctx: ServerCtx): ((arg: any) => any) | void

  constructor(tag: string) {
    addInterceptor(tag, this.use.bind(this))
  }
}
