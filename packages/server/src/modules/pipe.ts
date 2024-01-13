import { getSymbol } from 'phecda-core'
import { Context, addPipe } from '../context'
import { Dev } from './dev'
export abstract class PPipe<C = any> extends Dev {
  constructor() {
    super()

    const key = getSymbol(this)
    addPipe(key, this.use.bind(this))
    this.onUnmount(() => {
      delete Context.pipeRecord[key]
    })
  }

  abstract use(param: { arg: any; option?: any; key: string; type: string; index: number; reflect: any }, tag: string, ctx: C): any
}
