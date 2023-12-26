import { addInterceptor } from '../context'
import { Dev } from './dev'

export abstract class PInterceptor extends Dev {
  abstract use<C>(tag: string, ctx: C): ((arg: any) => any) | void

  constructor(key: string) {
    super()
    this.onUnmount(() => {
      addInterceptor(key, null as any)
    })
    addInterceptor(key, this.use.bind(this))
  }
}
