import { getTag } from 'phecda-core'
import { Context, addPlugin } from '../context'
import { ServerBase } from './base'

export abstract class PPlugin extends ServerBase {
  readonly key: PropertyKey
  constructor(tag?: string) {
    super()
    this.key = tag || getTag(this)

    addPlugin(this.key, this.use.bind(this))

    this.onUnmount(() => {
      delete Context.pluginRecord[this.key]
    })
  }

  abstract use<Plugin = any>(framework: string): Plugin | undefined
}
