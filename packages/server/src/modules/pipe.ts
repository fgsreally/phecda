import { addPipe } from '../context'
import { Dev } from './dev'
import {getSymbol} from 'phecda-core' 
export abstract class PPipe<C = any> extends Dev {
  constructor() {
    super()

    const key=getSymbol(this)
    addPipe(key, this.use.bind(this))
    this.onUnmount(() => {
      delete Context.guardRecord[key]

    })
  }

  abstract use(args: { arg: any; option?: any; key: string; type: string; index: number; reflect: any }, tag: string, ctx: C): Promise<any>
}
