import { addInterceptor } from '../context'
import type { ServerCtx, ServerMergeCtx } from '../types'

export abstract class ServerInterceptor {
  abstract use(ctx: ServerCtx, isMerge?: false): ((arg: any) => any) | void
  abstract use(ctx: ServerMergeCtx, isMerge?: true): ((arg: any) => any) | void

  constructor(tag: string) {
    addInterceptor(tag, this.use.bind(this))
  }
}
