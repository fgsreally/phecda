import { getSymbol } from 'phecda-core'
import { Context, addPlugin } from '../context'
import { Dev } from '../modules/dev'

export abstract class PPlugin extends Dev {
  constructor() {
    super()
    const key = getSymbol(this)

    addPlugin(key, this.use.bind(this))

    this.onUnmount(() => {
      delete Context.pluginRecord[key]
    })
  }

  abstract use(...args: any): void
}
