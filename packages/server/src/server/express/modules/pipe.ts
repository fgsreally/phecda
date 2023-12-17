import type { ExpressCtx } from '../context'
import { setPipe } from '../context'

export abstract class ExpressPipe {
  constructor() {
    setPipe(this.use.bind(this))
  }

  abstract use(args: { arg: any; option?: any; key: string; type: string; index: number; reflect: any }[], tag: string, ctx: ExpressCtx): Promise<any[]>
}
