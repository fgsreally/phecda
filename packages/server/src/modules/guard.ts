import { addGuard } from '../context'
import { Dev } from './dev'

export abstract class PGuard extends Dev {
  abstract use<C>(tag: string, ctx: C): Promise<boolean> | boolean

  constructor() {
    super()
    const key=getSymbol(this)

    addGuard(key, this.use.bind(this))

    this.onUnmount(() => {
      delete Context.guardRecord[key]

    })
  }
}
