import { getSymbol } from 'phecda-core'
import type { P } from '../types'
import { Context, addGuard, addInterceptor, addPipe, addPlugin, setFilter } from '../context'
import type { Exception } from '../exception'
import { defaultFilter } from '../filter'
import { Dev } from './dev'

export interface PModule<C = any> {

  intercept(tag: string, ctx: C): Function | Promise<Function> | any

  guard(tag: string, ctx: C): Promise<boolean> | boolean

  pipe(param: { arg: any; option?: any; key: string; type: string; index: number; reflect: any }, tag: string, ctx: C): any

  filter< E extends Exception = Exception>(error: Error | E, tag?: string, ctx?: C): P.Error

  plugin(...args: any): void
}

export class PModule extends Dev {
  constructor(tag?: string) {
    super()

    const key = tag || getSymbol(this)

    if (this.pipe) {
      addPipe(key, this.pipe.bind(this))
      this.onUnmount(() => {
        delete Context.pipeRecord[key]
      })
    }

    if (this.plugin) {
      addPlugin(key, this.plugin.bind(this))

      this.onUnmount(() => {
        delete Context.pluginRecord[key]
      })
    }
    if (this.intercept) {
      addInterceptor(key, this.intercept.bind(this))

      this.onUnmount(() => {
        delete Context.interceptorRecord[key]
      })
    }
    if (this.guard) {
      addGuard(key, this.guard.bind(this))

      this.onUnmount(() => {
        delete Context.guardRecord[key]
      })
    }

    if (this.filter) {
      setFilter(this.filter.bind(this))
      this.onUnmount(() => {
        setFilter(defaultFilter)
      })
    }
  }
}
