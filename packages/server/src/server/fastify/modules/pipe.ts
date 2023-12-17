import type { FastifyCtx } from '../context'
import { setPipe } from '../context'

export abstract class FastifyPipe {
  constructor() {
    setPipe(this.use.bind(this))
  }

  abstract use(args: { arg: any; option?: any; key: string; type: string; index: number; reflect: any }[], tag: string, ctx: FastifyCtx): Promise<any[]>
}
