import { addGuard } from '../context'
import type { ServerCtx } from '../types'

export abstract class ServerGuard {
  abstract use(ctx: ServerCtx): Promise<boolean> | boolean

  constructor(tag: string) {
    addGuard(tag, this.use.bind(this))
  }
}
