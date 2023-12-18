import { addGuard } from '../context'

export abstract class PGuard {
  abstract use<C>(tag: string, ctx: C): Promise<boolean> | boolean

  constructor(tag: string) {
    addGuard(tag, this.use.bind(this))
  }
}
