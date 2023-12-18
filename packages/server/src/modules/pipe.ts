import { setPipe } from '../context'

export abstract class PPipe {
  constructor() {
    setPipe(this.use.bind(this))
  }

  abstract use<C>(args: { arg: any; option?: any; key: string; type: string; index: number; reflect: any }[], tag: string, ctx: C): Promise<any[]>
}
