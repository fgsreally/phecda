import type { FastifyCtx } from '../context'
import { addGuard } from '../context'

export abstract class FastifyGuard {
  abstract use(tag: string, ctx: FastifyCtx): Promise<boolean> | boolean

  constructor(tag: string) {
    addGuard(tag, this.use.bind(this))
  }
}
