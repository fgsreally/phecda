import { getSymbol } from 'phecda-core'
import { Context, addPlugin } from '../context'
import { Dev } from '../modules/dev'

export abstract class PPlugin extends Dev {
  readonly key: string
  constructor(tag?: string) {
    super()
    this.key = tag || getSymbol(this)

    addPlugin(this.key, this.use.bind(this))

    this.onUnmount(() => {
      delete Context.pluginRecord[this.key]
    })
  }

  abstract use(...args: any): void
}
