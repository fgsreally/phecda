import { addInterceptor } from '../context'
import { Dev } from './dev'
import {getSymbol} from 'phecda-core' 


export abstract class PInterceptor extends Dev {
  abstract use<C>(tag: string, ctx: C): ((arg: any) => any) | void

  constructor() {
    super()

    const key = getSymbol(this)

    this.onUnmount(() => {
      delete Context.interceptorRecord[key]
    })
    addInterceptor(key, this.use.bind(this))
  }
}
