import { addInterceptor } from '../context'

export abstract class PInterceptor {
  abstract use<C>(tag: string, ctx: C): ((arg: any) => any) | void

  constructor(tag: string) {
    addInterceptor(tag, this.use.bind(this))
  }
}
