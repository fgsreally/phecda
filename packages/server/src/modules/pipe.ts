import { addPipe } from '../context'
import { Dev } from './dev'

export abstract class PPipe<C = any> extends Dev {
  constructor(key: string) {
    super()
    addPipe(key, this.use.bind(this))
    this.onUnmount(() => {
      addPipe(key, null as any)
    })
  }

  abstract use(args: { arg: any; option?: any; key: string; type: string; index: number; reflect: any }, tag: string, ctx: C): Promise<any>
}
