import type { ExpressCtx } from '../context'
import { addGuard } from '../context'

export abstract class ExpressGuard {
  abstract use(tag: string, ctx: ExpressCtx): Promise<boolean> | boolean

  constructor(tag: string) {
    addGuard(tag, this.use.bind(this))
  }
}
