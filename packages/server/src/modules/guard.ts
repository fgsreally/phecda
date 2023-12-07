import { addGuard } from '../context'
import type { ServerCtx, ServerMergeCtx } from '../types'

export abstract class ServerGuard {
  abstract use(ctx: ServerCtx, isMerge?: false): Promise<boolean> | boolean
  abstract use(ctx: ServerMergeCtx, isMerge?: true): Promise<boolean> | boolean

  constructor(tag: string) {
    addGuard(tag, this.use.bind(this))
  }
}
