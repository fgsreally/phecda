import { getTag } from 'phecda-core'
import { Context, addAddon } from '../context'
import { ServerBase } from './base'

export abstract class PAddon extends ServerBase {
  readonly key: PropertyKey

  priority = 0
  constructor(tag?: string) {
    super()
    this.key = tag || getTag(this)

    addAddon(this.key, this.use.bind(this), this.priority)

    this.onUnmount(() => {
      delete Context.addonRecord[this.key]
    })
  }

  abstract use(router: any, framework: string): undefined
}
