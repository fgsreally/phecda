import { getTag } from 'phecda-core'
import { Context, addAddon } from '../context'
import { Dev } from './dev'

export abstract class PAddon<Params extends any[] = any[]> extends Dev {
  readonly key: PropertyKey
  constructor(tag?: string) {
    super()
    this.key = tag || getTag(this)

    addAddon(this.key, this.use.bind(this))

    this.onUnmount(() => {
      delete Context.addonRecord[this.key]
    })
  }

  abstract use(...args: Params): void
}
