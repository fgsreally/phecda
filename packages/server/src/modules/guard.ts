import { addGuard } from '../context'
import { Dev } from './dev'

export abstract class PGuard extends Dev {
  abstract use<C>(tag: string, ctx: C): Promise<boolean> | boolean

  constructor(key: string) {
    super()
    addGuard(key, this.use.bind(this))

    this.onUnmount(() => {
      addGuard(key, null as any)
    })
  }
}
