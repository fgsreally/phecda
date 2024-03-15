import { getTag } from 'phecda-core'
import { Context, addPlugin } from '../context'
import { Dev } from './dev'

export abstract class PPlugin<Params extends any[] = any[]> extends Dev {
  readonly key: PropertyKey
  constructor(tag?: string) {
    super()
    this.key = tag || getTag(this)

    addPlugin(this.key, this.use.bind(this))

    this.onUnmount(() => {
      delete Context.pluginRecord[this.key]
    })
  }

  abstract use(...args: Params): void
}
