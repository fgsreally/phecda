import { setPipe } from '../context'
import type { ServerCtx } from '../types'

export abstract class ServerPipe {
  constructor() {
    setPipe(this.use.bind(this))
  }

  abstract use(args: { arg: any; option?: any; key: string; type: string; index: number; reflect: any }[], tag: string, ctx: ServerCtx): Promise<any[]>
}
