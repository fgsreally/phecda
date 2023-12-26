import { addPipe } from '../context'

export abstract class PPipe<C = any> {
  constructor(key: string) {
    addPipe(key, this.use.bind(this))
  }

  abstract use(args: { arg: any; option?: any; key: string; type: string; index: number; reflect: any }, tag: string, ctx: C): Promise<any>
}
